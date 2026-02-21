

import { EventTypes, findCodeAncestor } from "@utils/dom";
import { Plugin, PluginExtension, ExtensiblePlugin } from "@core/plugin-engine";
import { KeyboardKeys } from "@utils/keyboard";
import { findClosestBlockBySelection } from "@utils/selection";

import {
    MarkdownShortcutContext,
    MarkdownShortcutHandlerResult,
    MarkdownShortcutMatch,
    MarkdownShortcutRule,
    MarkdownShortcutTrigger,
} from "./types.ts";

export class MarkdownShortcutsPlugin extends ExtensiblePlugin<MarkdownShortcutExtensionPlugin> {
    private contentArea: HTMLElement | null = null;
    private keyTarget: HTMLElement | null = null;
    private shortcuts: MarkdownShortcutRule[] = [];

    override setup(root: HTMLElement, _plugins: Plugin[]): void {
        const contentArea = root.querySelector<HTMLElement>("#contentArea");
        const editableRoot = root.querySelector<HTMLElement>('[contenteditable="true"]');
        this.contentArea = contentArea ?? editableRoot;
        this.keyTarget = editableRoot ?? contentArea;

        if (!this.keyTarget) {
            console.warn("[MarkdownShortcutsPlugin] Unable to find content area.");
            return;
        }

        this.keyTarget.addEventListener(EventTypes.KeyDown, this.handleKeyDown, true);
        this.keyTarget.addEventListener(EventTypes.BeforeInput, this.handleBeforeInput, true);
    }

    override attachExtensions(extensions: MarkdownShortcutExtensionPlugin[]): void {
        this.shortcuts = extensions.flatMap((ext) => ext.shortcuts());
        this.shortcuts.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
    }

    private readonly handleKeyDown = (event: KeyboardEvent) => {

        if (event.defaultPrevented || event.isComposing) return;
        if (event.ctrlKey || event.metaKey || event.altKey) return;

        if (event.key === KeyboardKeys.Tab && !event.shiftKey) {
            const inlineHandled = this.tryApplyInlineShortcutAtCaret();
            if (!inlineHandled) return;

            event.preventDefault();
            event.stopPropagation();
            return;
        }

        const trigger = this.resolveTrigger(event);
        if (!trigger) return;

        const context = this.buildContext(trigger, event);
        if (!context) return;

        const match = this.findMatch(context);
        if (!match) return;

        event.preventDefault();
        event.stopPropagation();

        this.applyMatch(context, match);
    };

    private readonly handleBeforeInput = (event: InputEvent) => {
        if (event.defaultPrevented || event.isComposing) return;

        const trigger = this.resolveInputTrigger(event);
        if (!trigger) return;

        const context = this.buildContext(trigger, event);
        if (!context) return;

        const match = this.findMatch(context);
        if (!match) return;

        event.preventDefault();
        event.stopPropagation();

        this.applyMatch(context, match);
    };

    private resolveTrigger(event: KeyboardEvent): MarkdownShortcutTrigger | null {
        if (event.key === KeyboardKeys.Space) return "space";
        if (event.key === KeyboardKeys.Enter) return "enter";
        return null;
    }

    private tryApplyInlineShortcutAtCaret(): boolean {
        
        const selection = globalThis.getSelection();
        if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) return false;

        const range = selection.getRangeAt(0);
        if (!(range.startContainer instanceof Text)) return false;
        if (findCodeAncestor(range.startContainer)) return false;

        const textNode = range.startContainer;
        const caretOffset = range.startOffset;
        const before = textNode.data.slice(0, caretOffset);
        const after = textNode.data.slice(caretOffset);
        
        const match = this.findInlineMatch(before);
        if (!match) return false;

        const prefix = before.slice(0, match.fullStart);
        const content = before.slice(match.contentStart, match.contentEnd);
        
        if (!content) return false;

        const parent = textNode.parentNode;
        if (!parent) return false;

        const fragment = document.createDocumentFragment();
        if (prefix) fragment.appendChild(document.createTextNode(prefix));

        const formattedNode = this.createInlineFormattedNode(match.kind, content);
        fragment.appendChild(formattedNode);

        if (after) fragment.appendChild(document.createTextNode(after));

        parent.replaceChild(fragment, textNode);

        const nextRange = document.createRange();
        if (formattedNode.nextSibling instanceof Text) {
            nextRange.setStart(formattedNode.nextSibling, 0);
            nextRange.collapse(true);
        } else {
            nextRange.setStartAfter(formattedNode);
            nextRange.collapse(true);
        }

        selection.removeAllRanges();
        selection.addRange(nextRange);

        return true;
    }

    private findInlineMatch(text: string): {
        kind: "bold" | "italic" | "boldItalic" | "strike" | "code";
        fullStart: number;
        contentStart: number;
        contentEnd: number;
    } | null {
        const candidates: Array<{ open: string; close: string; kind: "bold" | "italic" | "boldItalic" | "strike" | "code" }> = [
            { open: "***", close: "***", kind: "boldItalic" },
            { open: "**", close: "**", kind: "bold" },
            { open: "__", close: "__", kind: "bold" },
            { open: "~~", close: "~~", kind: "strike" },
            { open: "*", close: "*", kind: "italic" },
            { open: "_", close: "_", kind: "italic" },
            { open: "`", close: "`", kind: "code" },
        ];

        for (const candidate of candidates) {
            if (!text.endsWith(candidate.close)) continue;

            const closeStart = text.length - candidate.close.length;
            if (!this.isValidClosingMarker(text, candidate.open, closeStart)) continue;

            const openIndex = this.findOpeningMarker(text, candidate.open, closeStart);
            if (openIndex < 0) continue;

            const contentStart = openIndex + candidate.open.length;
            const contentEnd = closeStart;
            if (contentEnd <= contentStart) continue;

            return {
                kind: candidate.kind,
                fullStart: openIndex,
                contentStart,
                contentEnd,
            };
        }

        return null;
    }

    private findOpeningMarker(text: string, marker: string, closeStart: number): number {
        let searchFrom = closeStart - marker.length;

        while (searchFrom >= 0) {
            const openIndex = text.lastIndexOf(marker, searchFrom);
            if (openIndex < 0) return -1;

            if (this.isValidOpeningMarker(text, marker, openIndex)) return openIndex;
            searchFrom = openIndex - 1;
        }

        return -1;
    }

    private isValidOpeningMarker(text: string, marker: string, index: number): boolean {
        const markerChar = this.getRepeatedMarkerChar(marker);
        if (!markerChar) return true;

        const prev = text[index - 1];
        const next = text[index + marker.length];

        return prev !== markerChar && next !== markerChar;
    }

    private isValidClosingMarker(text: string, marker: string, closeStart: number): boolean {
        const markerChar = this.getRepeatedMarkerChar(marker);
        if (!markerChar) return true;

        const prev = text[closeStart - 1];
        const next = text[closeStart + marker.length];

        return prev !== markerChar && next !== markerChar;
    }

    private getRepeatedMarkerChar(marker: string): string | null {
        if (marker.length === 0) return null;
        const markerChar = marker[0];
        if (!markerChar) return null;
        return marker.split("").every((char) => char === markerChar) ? markerChar : null;
    }

    private createInlineFormattedNode(kind: "bold" | "italic" | "boldItalic" | "strike" | "code", content: string): HTMLElement {
        if (kind === "bold") {
            const node = document.createElement("strong");
            node.textContent = content;
            return node;
        }

        if (kind === "italic") {
            const node = document.createElement("em");
            node.textContent = content;
            return node;
        }

        if (kind === "strike") {
            const node = document.createElement("s");
            node.textContent = content;
            return node;
        }

        if (kind === "code") {
            const node = document.createElement("code");
            node.textContent = content;
            return node;
        }

        const strong = document.createElement("strong");
        const em = document.createElement("em");
        em.textContent = content;
        strong.appendChild(em);
        return strong;
    }


    private resolveInputTrigger(event: InputEvent): MarkdownShortcutTrigger | null {
        if (event.inputType === "insertText" && event.data === " ") return "space";
        if (event.inputType === "insertParagraph" || event.inputType === "insertLineBreak") return "enter";
        return null;
    }

    private buildContext(trigger: MarkdownShortcutTrigger, event: KeyboardEvent | InputEvent): Omit<MarkdownShortcutContext, "match"> | null {
        const contentArea = this.getContentArea();
        const selectionState = globalThis.getSelection();

        if (!contentArea || !selectionState || selectionState.rangeCount === 0) return null;
        if (!selectionState.isCollapsed) return null;

        const range = selectionState.getRangeAt(0);
        if (!contentArea.contains(range.startContainer)) return null;

        const block = findClosestBlockBySelection(selectionState);
        if (!block || !block.isContentEditable) return null;

        const codeAncestor = findCodeAncestor(range.startContainer);
        if (codeAncestor) return null;

        const textBeforeCaret = this.getTextBeforeCaret(block, range);
        const trimmed = textBeforeCaret.trim();
        if (!trimmed) return null;

        const fullText = block.textContent ?? "";
        const afterText = fullText.slice(textBeforeCaret.length);

        return {
            block,
            trigger,
            textBeforeCaret,
            afterText,
            event,
            selection: selectionState,
        };
    }

    private getTextBeforeCaret(block: HTMLElement, range: Range): string {
        const prefixRange = range.cloneRange();
        try {
            prefixRange.setStart(block, 0);
        } catch {
            return "";
        }
        return prefixRange.toString();
    }

    private findMatch(context: Omit<MarkdownShortcutContext, "match">): {
        rule: MarkdownShortcutRule;
        match: MarkdownShortcutMatch;
    } | null {
        const candidate = context.textBeforeCaret.trim();

        for (const rule of this.shortcuts) {
            if (rule.trigger !== context.trigger) continue;

            if (typeof rule.pattern === "string") {
                if (candidate !== rule.pattern) continue;
                return { rule, match: { text: candidate } };
            }

            const match = candidate.match(rule.pattern);
            if (!match || match[0] !== candidate) continue;
            return { rule, match: { text: candidate, match } };
        }

        return null;
    }

    private applyMatch(
        context: Omit<MarkdownShortcutContext, "match">,
        result: { rule: MarkdownShortcutRule; match: MarkdownShortcutMatch }
    ) {
        const fullContext: MarkdownShortcutContext = {
            ...context,
            match: result.match,
        };

        const handlerResult = result.rule.onMatch(fullContext);
        const outcome = this.resolveHandlerOutcome(handlerResult);

        if (!outcome.handled) return;
        if (outcome.removeBlock) {
            fullContext.block.remove();
        }
    }

    private resolveHandlerOutcome(result: MarkdownShortcutHandlerResult | void): { handled: boolean; removeBlock: boolean } {
        if (typeof result === "boolean") {
            return { handled: result, removeBlock: result };
        }

        if (typeof result === "object" && result !== null) {
            return {
                handled: result.handled ?? true,
                removeBlock: result.removeBlock ?? true,
            };
        }

        return { handled: true, removeBlock: true };
    }

    private getContentArea(): HTMLElement | null {
        if (this.contentArea && document.contains(this.contentArea)) return this.contentArea;
        if (this.keyTarget && document.contains(this.keyTarget)) return this.keyTarget;
        this.contentArea = document.getElementById("contentArea");
        if (!this.contentArea) {
            this.keyTarget = document.querySelector<HTMLElement>('[contenteditable="true"]');
        }
        return this.contentArea ?? this.keyTarget;
    }
}

export abstract class MarkdownShortcutExtensionPlugin extends PluginExtension<MarkdownShortcutsPlugin> {
    override readonly target = MarkdownShortcutsPlugin;
    abstract shortcuts(): MarkdownShortcutRule[];
}