/** @jsx h */

import { h, focusOnElement } from "../../index.ts";
import { MarkdownShortcutContext, MarkdownShortcutRule, MarkdownShortcutExtensionPlugin } from "../../markdown-shortcuts/index.ts";
import { createTodoList } from "../utils.tsx";

export class MarkdownShortcutTodoListExtension extends MarkdownShortcutExtensionPlugin {

    override shortcuts(): MarkdownShortcutRule[] {
        return [
            {
                pattern: "[]",
                trigger: "space",
                sort: 75,
                onMatch: (context) => this.insertTodoList(context),
            },
        ];
    }

    private insertTodoList(context: MarkdownShortcutContext) {
        const doc = context.block.ownerDocument ?? document;
        const list = createTodoList(doc);
        context.block.after(list);

        const span = list.querySelector<HTMLSpanElement>("span[contenteditable]");
        const text = context.afterText.trimStart();
        if (span && text) {
            span.textContent = text;
            span.classList.remove("empty", "placeholder");
            span.removeAttribute("data-placeholder");
        }

        focusOnElement(span ?? list);
    }
}