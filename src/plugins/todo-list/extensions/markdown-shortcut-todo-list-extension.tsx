import { focusOnElement } from "@utils/dom";
import { MarkdownShortcutContext, MarkdownShortcutRule, MarkdownShortcutExtensionPlugin } from "@plugin/markdown-shortcuts";
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
            span.classList.remove("empty", "guten-placeholder");
            span.removeAttribute("data-placeholder");
        }

        focusOnElement(span ?? list);
    }
}