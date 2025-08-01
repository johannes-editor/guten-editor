/** @jsx h */

import { h, t, focusOnElement } from "../index.ts";
import { SlashMenuExtensionPlugin } from "../slash-menu/index.ts";
import { TodoList } from "./components/todo-list.tsx";

export class SlashMenuTodoListExtensionPlugin extends SlashMenuExtensionPlugin {
    
    sort: number;
    label: string;
    synonyms: string[];

    constructor() {
        super();
        this.sort = 9;
        this.label = t("todo_list");
        this.synonyms = [t("list"), t("checkbox"), t("todo")];
    }

    onSelect(focusedBlock: HTMLElement): void {
        const element = <TodoList class="block" />;
        focusedBlock.after(element);
        const span = element.querySelector("span");
        focusOnElement(span);
    }
}