import { focusOnElement } from "@utils/dom";
import { MarkdownShortcutContext, MarkdownShortcutRule, MarkdownShortcutExtensionPlugin } from "@plugins/markdown-shortcuts";
import { TodoListBlock } from "../components/todo-list.tsx";

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
        const list = <TodoListBlock /> ;
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