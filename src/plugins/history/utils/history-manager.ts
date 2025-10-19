import { CommandContext } from "../../../core/command/command.ts";
import { commandRegistry } from "../../../core/command/index.ts";
import { ChangeRecord, COMMAND_COMMIT_DELAY, DocumentChange, MAX_HISTORY, NodeSnapshot, observerConfig, SelectionSnapshot, Transaction, TYPING_COMMIT_DELAY } from "./types.ts";

export class HistoryManager {
    private root: HTMLElement | null = null;
    private observer: MutationObserver | null = null;
    private transaction: Transaction | null = null;
    private commitTimer: number | null = null;
    private suppressMutations = false;

    private history: DocumentChange[] = [];
    private future: DocumentChange[] = [];

    private originalCommandRun: ((id: string, context?: CommandContext) => boolean) | null = null;

    private inputHandler = () => {
        this.beginTransaction();
        this.scheduleCommit(TYPING_COMMIT_DELAY);
    };

    private mutationHandler = (mutations: MutationRecord[]) => {
        if (this.suppressMutations) return;
        if (!this.root) return;

        let observed = false;
        for (const mutation of mutations) {
            if (!this.root.contains(mutation.target)) continue;
            this.beginTransaction();
            this.recordMutation(mutation);
            observed = true;
        }

        if (observed && !this.commitTimer) {
            this.scheduleCommit(TYPING_COMMIT_DELAY);
        }
    };

    attach(root: HTMLElement): void {
        if (this.root === root) return;
        const content = root.querySelector<HTMLElement>("#contentArea");
        if (!content) {
            console.warn("[UndoRedoPlugin] Unable to locate #contentArea inside editor root.");
            return;
        }

        this.root = content;
        this.startObserver();
        content.addEventListener("input", this.inputHandler);
        this.patchCommandRegistry();
    }

    undo(): boolean {
        if (!this.root) return false;
        this.flushPendingTransaction();
        const change = this.history.pop();
        if (!change) return false;

        this.withoutObservation(() => {
            for (let i = change.changes.length - 1; i >= 0; i--) {
                this.applyChange(change.changes[i], "undo");
            }
        });

        if (change.beforeSelection) this.restoreSelection(change.beforeSelection);
        this.future.push(change);
        return true;
    }

    redo(): boolean {
        if (!this.root) return false;
        this.flushPendingTransaction();
        const change = this.future.pop();
        if (!change) return false;

        this.withoutObservation(() => {
            for (const record of change.changes) {
                this.applyChange(record, "redo");
            }
        });

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

    private startObserver() {
        if (!this.root) return;
        if (this.observer) this.observer.disconnect();
        this.observer = new MutationObserver(this.mutationHandler);
        this.observer.observe(this.root, observerConfig);
    }

    private beginTransaction() {
        if (!this.root) return;
        if (this.transaction) return;
        this.transaction = {
            changes: [],
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
        if (!this.transaction) return;
        if (this.transaction.changes.length === 0) {
            this.transaction = null;
            return;
        }

        const afterSelection = this.captureSelection();
        const entry: DocumentChange = {
            changes: this.transaction.changes,
            beforeSelection: this.transaction.beforeSelection,
            afterSelection,
        };

        this.history.push(entry);
        if (this.history.length > MAX_HISTORY) this.history.shift();
        this.future = [];
        this.transaction = null;
    }

    private recordMutation(mutation: MutationRecord) {
        if (!this.root || !this.transaction) return;
        switch (mutation.type) {
            case "characterData":
                this.recordCharacterDataMutation(mutation);
                break;
            case "attributes":
                this.recordAttributeMutation(mutation);
                break;
            case "childList":
                this.recordChildListMutation(mutation);
                break;
        }
    }

    private recordCharacterDataMutation(mutation: MutationRecord) {
        if (!this.root || !this.transaction) return;
        const target = mutation.target as CharacterData;
        if (!this.root.contains(target)) return;
        const path = getNodePath(this.root, target);
        const existing = this.transaction.changes.find(
            (change): change is Extract<ChangeRecord, { type: "text" }> =>
                change.type === "text" && pathsEqual(change.path, path),
        );

        if (existing) {
            existing.after = target.data;
        } else {
            this.transaction.changes.push({
                type: "text",
                path,
                before: mutation.oldValue ?? "",
                after: target.data,
            });
        }
    }

    private recordAttributeMutation(mutation: MutationRecord) {
        if (!this.root || !this.transaction) return;
        const target = mutation.target as Element;
        if (!this.root.contains(target)) return;
        const path = getNodePath(this.root, target);
        const attr = mutation.attributeName ?? "";
        const existing = this.transaction.changes.find(
            (change): change is Extract<ChangeRecord, { type: "attribute" }> =>
                change.type === "attribute" && change.attribute === attr && pathsEqual(change.path, path),
        );
        const after = target.getAttribute(attr);
        if (existing) {
            existing.after = after;
        } else {
            this.transaction.changes.push({
                type: "attribute",
                path,
                attribute: attr,
                before: mutation.oldValue,
                after,
            });
        }
    }

    private recordChildListMutation(mutation: MutationRecord) {
        if (!this.root || !this.transaction) return;
        const parent = mutation.target as ParentNode;
        if (!this.root.contains(parent as Node)) return;
        const parentPath = getNodePath(this.root, parent as Node);

        if (mutation.removedNodes.length) {
            const index = mutation.nextSibling
                ? getNodeIndex(parent, mutation.nextSibling)
                : parent.childNodes.length;
            const nodes = Array.from(mutation.removedNodes, serializeNode).filter(Boolean) as NodeSnapshot[];
            if (nodes.length) {
                this.transaction.changes.push({
                    type: "remove",
                    parentPath,
                    index,
                    nodes,
                });
            }
        }

        if (mutation.addedNodes.length) {
            const first = mutation.addedNodes[0];
            const index = getNodeIndex(parent, first);
            const nodes = Array.from(mutation.addedNodes, serializeNode).filter(Boolean) as NodeSnapshot[];
            if (nodes.length) {
                this.transaction.changes.push({
                    type: "insert",
                    parentPath,
                    index,
                    nodes,
                });
            }
        }
    }

    private applyChange(change: ChangeRecord, direction: "undo" | "redo") {
        if (!this.root) return;
        switch (change.type) {
            case "text": {
                const node = getNodeFromPath(this.root, change.path) as CharacterData | null;
                if (!node) break;
                node.data = direction === "undo" ? change.before : change.after;
                break;
            }
            case "attribute": {
                const node = getNodeFromPath(this.root, change.path) as Element | null;
                if (!node) break;
                const value = direction === "undo" ? change.before : change.after;
                if (value === null || value === undefined) node.removeAttribute(change.attribute);
                else node.setAttribute(change.attribute, value);
                break;
            }
            case "insert": {
                const parent = getNodeFromPath(this.root, change.parentPath) as ParentNode | null;
                if (!parent) break;
                if (direction === "undo") {
                    removeNodes(parent, change.index, change.nodes.length);
                } else {
                    insertNodes(parent, change.index, change.nodes);
                }
                break;
            }
            case "remove": {
                const parent = getNodeFromPath(this.root, change.parentPath) as ParentNode | null;
                if (!parent) break;
                if (direction === "undo") {
                    insertNodes(parent, change.index, change.nodes);
                } else {
                    removeNodes(parent, change.index, change.nodes.length);
                }
                break;
            }
        }
    }

    private withoutObservation(fn: () => void) {
        if (!this.root || !this.observer) {
            fn();
            return;
        }

        this.observer.disconnect();
        this.suppressMutations = true;
        try {
            fn();
        } finally {
            this.suppressMutations = false;
            this.observer.observe(this.root, observerConfig);
            this.transaction = null;
        }
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
}



function getNodePath(root: Node, node: Node): number[] {
    const path: number[] = [];
    let current: Node | null = node;
    while (current && current !== root) {
        const parent : any = current.parentNode;
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

function pathsEqual(a: number[], b: number[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((value, index) => value === b[index]);
}

function getNodeIndex(parent: ParentNode, node: Node): number {
    return Array.prototype.indexOf.call(parent.childNodes, node);
}

function serializeNode(node: Node): NodeSnapshot | null {
    switch (node.nodeType) {
        case Node.TEXT_NODE:
            return { kind: "text", text: node.textContent ?? "" };
        case Node.COMMENT_NODE:
            return { kind: "comment", text: node.textContent ?? "" };
        case Node.ELEMENT_NODE:
            return { kind: "element", html: (node as Element).outerHTML };
        default:
            return null;
    }
}

function insertNodes(parent: ParentNode, index: number, nodes: NodeSnapshot[]) {
    const fragment = document.createDocumentFragment();
    for (const snapshot of nodes) fragment.appendChild(deserializeNode(snapshot));
    const reference = parent.childNodes[index] ?? null;
    parent.insertBefore(fragment, reference);
}

function removeNodes(parent: ParentNode, index: number, count: number) {
    for (let i = 0; i < count; i++) {
        const child = parent.childNodes[index];
        if (!child) break;
        parent.removeChild(child);
    }
}

function getNodeLength(node: Node): number {
    if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.COMMENT_NODE) {
        return (node.textContent ?? "").length;
    }
    return (node as ParentNode).childNodes.length;
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
            return template.content.firstChild ?? document.createTextNode("");
        }
    }
}