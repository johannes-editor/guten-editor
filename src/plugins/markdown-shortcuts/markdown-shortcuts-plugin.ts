import { dom, ExtensiblePlugin, keyboard, Plugin, PluginExtension, selection } from "../index.ts";

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

        this.keyTarget.addEventListener("keydown", this.handleKeyDown, true);
    }

    override attachExtensions(extensions: MarkdownShortcutExtensionPlugin[]): void {
        this.shortcuts = extensions.flatMap((ext) => ext.shortcuts());
        this.shortcuts.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
    }

    private readonly handleKeyDown = (event: KeyboardEvent) => {

        if (event.defaultPrevented || event.isComposing) return;
        if (event.ctrlKey || event.metaKey || event.altKey) return;

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

    private resolveTrigger(event: KeyboardEvent): MarkdownShortcutTrigger | null {
        if (event.key === keyboard.KeyboardKeys.Space) return "space";
        if (event.key === keyboard.KeyboardKeys.Enter) return "enter";
        return null;
    }

    private buildContext(trigger: MarkdownShortcutTrigger, event: KeyboardEvent): Omit<MarkdownShortcutContext, "match"> | null {
        const contentArea = this.getContentArea();
        const selectionState = globalThis.getSelection();

        if (!contentArea || !selectionState || selectionState.rangeCount === 0) return null;
        if (!selectionState.isCollapsed) return null;

        const range = selectionState.getRangeAt(0);
        if (!contentArea.contains(range.startContainer)) return null;

        const block = selection.findClosestBlockBySelection(selectionState);
        if (!block || !block.isContentEditable) return null;

        const codeAncestor = dom.findCodeAncestor(range.startContainer);
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