import { CommandContext } from "../../../core/command/command.ts";
import { commandRegistry } from "../../../core/command/index.ts";
import { Component } from "@core/components/component.ts";
import { COMMAND_COMMIT_DELAY, DocumentChange, MAX_HISTORY, NodeSnapshot, SelectionSnapshot, Transaction, TYPING_COMMIT_DELAY } from "./types.ts";

export class HistoryManager {
    private root: HTMLElement | null = null;
    private transaction: Transaction | null = null;
    private commitTimer: number | null = null;

    private history: DocumentChange[] = [];
    private future: DocumentChange[] = [];

    private originalCommandRun: ((id: string, context?: CommandContext) => boolean) | null = null;

    private keydownHandler = (event: KeyboardEvent) => {
        if (!this.shouldTrackKeydown(event)) return;
        this.beginTransaction();
        this.scheduleCommit(TYPING_COMMIT_DELAY);
    };

    private inputHandler = () => {
        this.beginTransaction();
        this.scheduleCommit(TYPING_COMMIT_DELAY);
    };

    attach(root: HTMLElement): void {
        if (this.root === root) return;

        if (this.root) {
            this.root.removeEventListener("keydown", this.keydownHandler);
            this.root.removeEventListener("input", this.inputHandler);
        }

        const content = root.querySelector<HTMLElement>("#contentArea");
        if (!content) {
            console.warn("[UndoRedoPlugin] Unable to locate #contentArea inside editor root.");
            return;
        }

        this.root = content;
        this.history = [];
        this.future = [];
        this.transaction = null;

        content.addEventListener("keydown", this.keydownHandler);
        content.addEventListener("input", this.inputHandler);
        this.patchCommandRegistry();
    }

    undo(): boolean {
        if (!this.root) return false;
        this.flushPendingTransaction();

        const change = this.history.pop();
        if (!change) return false;

        this.applySnapshot(change.before);
        if (change.beforeSelection) this.restoreSelection(change.beforeSelection);
        this.future.push(change);
        return true;
    }

    redo(): boolean {
        if (!this.root) return false;
        this.flushPendingTransaction();

        const change = this.future.pop();
        if (!change) return false;

        this.applySnapshot(change.after);
        if (change.afterSelection) this.restoreSelection(change.afterSelection);
        this.history.push(change);
        return true;
    }

    private patchCommandRegistry() {
        if (this.originalCommandRun) return;
        const original = commandRegistry.run.bind(commandRegistry);
        this.originalCommandRun = original;
        const manager = this;
        commandRegistry.run = function (id: string, context?: CommandContext): boolean {
            manager.flushPendingTransaction();
            manager.beginTransaction();
            const result = original(id, context);
            manager.scheduleCommit(COMMAND_COMMIT_DELAY);
            return result;
        };
    }

    private beginTransaction() {
        if (!this.root) return;
        if (this.transaction) return;

        this.transaction = {
            beforeNodes: captureNodes(this.root),
            beforeSelection: this.captureSelection(),
        };
    }

    private scheduleCommit(delay: number) {
        if (!this.transaction) return;
        if (this.commitTimer !== null) globalThis.clearTimeout(this.commitTimer);
        this.commitTimer = globalThis.setTimeout(() => {
            this.commitTimer = null;
            this.commitTransaction();
        }, delay);
    }

    private flushPendingTransaction() {
        if (this.commitTimer !== null) {
            globalThis.clearTimeout(this.commitTimer);
            this.commitTimer = null;
        }
        this.commitTransaction();
    }

    private commitTransaction() {
        if (!this.transaction || !this.root) return;

        const afterNodes = captureNodes(this.root);
        if (snapshotsEqual(this.transaction.beforeNodes, afterNodes)) {
            this.transaction = null;
            return;
        }

        const change: DocumentChange = {
            before: this.transaction.beforeNodes,
            after: afterNodes,
            beforeSelection: this.transaction.beforeSelection,
            afterSelection: this.captureSelection(),
        };

        this.history.push(change);
        if (this.history.length > MAX_HISTORY) this.history.shift();
        this.future = [];
        this.transaction = null;
    }

    private applySnapshot(nodes: NodeSnapshot[]) {
        if (!this.root) return;

        const fragment = document.createDocumentFragment();
        for (const snapshot of nodes) {
            fragment.appendChild(deserializeNode(snapshot));
        }

        if ("customElements" in globalThis && typeof customElements.upgrade === "function") {
            customElements.upgrade(fragment);
        }

        while (this.root.firstChild) {
            this.root.removeChild(this.root.firstChild);
        }

        this.root.appendChild(fragment);
    }

    private captureSelection(): SelectionSnapshot | undefined {
        if (!this.root) return undefined;
        const selection = this.root.ownerDocument?.getSelection();
        if (!selection || selection.rangeCount === 0) return undefined;
        const anchor = selection.anchorNode;
        const focus = selection.focusNode;
        if (!anchor || !focus) return undefined;
        if (!this.root.contains(anchor) || !this.root.contains(focus)) return undefined;
        return {
            anchorPath: getNodePath(this.root, anchor),
            anchorOffset: selection.anchorOffset,
            focusPath: getNodePath(this.root, focus),
            focusOffset: selection.focusOffset,
            isCollapsed: selection.isCollapsed,
        };
    }

    private restoreSelection(snapshot: SelectionSnapshot) {
        if (!this.root) return;
        const selection = this.root.ownerDocument?.getSelection();
        if (!selection) return;
        const anchor = getNodeFromPath(this.root, snapshot.anchorPath);
        const focus = getNodeFromPath(this.root, snapshot.focusPath);
        if (!anchor || !focus) return;
        const range = this.root.ownerDocument?.createRange();
        if (!range) return;
        range.setStart(anchor, Math.min(snapshot.anchorOffset, getNodeLength(anchor)));
        range.setEnd(focus, Math.min(snapshot.focusOffset, getNodeLength(focus)));
        selection.removeAllRanges();
        selection.addRange(range);
    }

    private shouldTrackKeydown(event: KeyboardEvent): boolean {
        if (event.defaultPrevented) return false;
        if (event.isComposing) return false;

        const key = event.key;
        const isModifier = event.ctrlKey || event.metaKey;

        if (isModifier) {
            const lower = key.toLowerCase();
            if (lower === "z" || lower === "y") return false;
            if (lower === "v" || lower === "x") return true;
            return false;
        }

        if (key === "Backspace" || key === "Delete" || key === "Enter") return true;
        if (key.length === 1) return true;
        return false;
    }
}

function captureNodes(root: ParentNode): NodeSnapshot[] {
    const snapshots: NodeSnapshot[] = [];
    for (const node of Array.from(root.childNodes)) {
        const snapshot = serializeNode(node);
        if (snapshot) snapshots.push(snapshot);
    }
    return snapshots;
}

function snapshotsEqual(a: NodeSnapshot[], b: NodeSnapshot[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        const left = a[i];
        const right = b[i];
        if (left.kind !== right.kind) return false;
        switch (left.kind) {
            case "text":
            case "comment":
                if (left.text !== (right as typeof left).text) return false;
                break;
            case "element":
                if (left.html !== (right as typeof left).html) return false;
                break;
        }
    }
    return true;
}

function getNodePath(root: Node, node: Node): number[] {
    const path: number[] = [];
    let current: Node | null = node;
    while (current && current !== root) {
        const parent: any = current.parentNode;
        if (!parent) break;
        const index = Array.prototype.indexOf.call(parent.childNodes, current);
        path.unshift(index);
        current = parent;
    }
    return path;
}

function getNodeFromPath(root: Node, path: number[]): Node | null {
    let current: Node | null = root;
    for (const index of path) {
        if (!current || !("childNodes" in current)) return null;
        current = current.childNodes[index] ?? null;
    }
    return current;
}

function getNodeLength(node: Node): number {
    if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.COMMENT_NODE) {
        return (node.textContent ?? "").length;
    }
    return (node as ParentNode).childNodes.length;
}

function serializeNode(node: Node): NodeSnapshot | null {
    switch (node.nodeType) {
        case Node.TEXT_NODE:
            return { kind: "text", text: node.textContent ?? "" };
        case Node.COMMENT_NODE:
            return { kind: "comment", text: node.textContent ?? "" };
        case Node.ELEMENT_NODE:
            return { kind: "element", html: serializeElement(node as Element) };
        default:
            return null;
    }
}


function deserializeNode(snapshot: NodeSnapshot): Node {
    switch (snapshot.kind) {
        case "text":
            return document.createTextNode(snapshot.text);
        case "comment":
            return document.createComment(snapshot.text);
        case "element": {
            const template = document.createElement("template");
            template.innerHTML = snapshot.html;
            const node = (template.content.firstElementChild ?? template.content.firstChild) ?? document.createTextNode("");

            if (!(node instanceof Element)) {
                return node;
            }

            const element = ensureUpgradedElement(node);

            if (element instanceof Component) {
                applyComponentSnapshot(element);
            }

            return element;
        }
    }
}

function ensureUpgradedElement(node: Element): Element {
    if (!("customElements" in globalThis)) return node;

    if (typeof customElements.upgrade === "function") {
        try {
            customElements.upgrade(node);
        } catch (error) {
            console.warn("[HistoryManager] Failed to upgrade custom element snapshot", error);
        }
    }

    const tagName = node.tagName.toLowerCase();
    const definition = customElements.get(tagName);
    if (!definition || node instanceof definition) {
        return node;
    }

    const upgraded = document.createElement(tagName);
    copyElementAttributes(node, upgraded);
    moveChildNodes(node, upgraded);
    return upgraded;
}

function copyElementAttributes(source: Element, target: Element) {
    for (const { name } of Array.from(target.attributes)) {
        target.removeAttribute(name);
    }
    for (const { name, value } of Array.from(source.attributes)) {
        target.setAttribute(name, value);
    }
}

function moveChildNodes(from: Element, to: Element) {
    while (from.firstChild) {
        to.appendChild(from.firstChild);
    }
}

function serializeElement(element: Element): string {
    if (!(element instanceof Component)) return element.outerHTML;

    const clone = element.cloneNode(true) as Element;
    const component = element as Component;

    const propsSnapshot = snapshotSerializableData(component.props ?? {});
    if (propsSnapshot) clone.setAttribute("data-component-props", propsSnapshot);

    const stateSnapshot = snapshotSerializableData(component.state ?? {});
    if (stateSnapshot) clone.setAttribute("data-component-state", stateSnapshot);

    return clone.outerHTML;
}

function applyComponentSnapshot(component: Component) {
    const propsAttr = component.getAttribute("data-component-props");
    if (propsAttr) {
        try {
            const parsed = JSON.parse(propsAttr) as Record<string, unknown>;
            component.props = { ...component.props, ...parsed } as typeof component.props;
        } catch (error) {
            console.warn("[HistoryManager] Unable to parse component props snapshot", error);
        }
        component.removeAttribute("data-component-props");
    }

    const stateAttr = component.getAttribute("data-component-state");
    if (stateAttr) {
        try {
            const parsed = JSON.parse(stateAttr) as Record<string, unknown>;
            component.state = { ...component.state, ...parsed } as typeof component.state;
        } catch (error) {
            console.warn("[HistoryManager] Unable to parse component state snapshot", error);
        }
        component.removeAttribute("data-component-state");
    }
}

function snapshotSerializableData(value: Record<string, unknown>): string | null {
    const entries = Object.entries(value).filter(([key]) => key !== "children");
    if (entries.length === 0) return null;

    const data: Record<string, unknown> = {};
    for (const [key, val] of entries) {
        if (typeof val === "function") continue;
        if (val instanceof Node) continue;
        data[key] = val;
    }

    if (Object.keys(data).length === 0) return null;

    try {
        return JSON.stringify(data);
    } catch {
        return null;
    }
}