/** @jsx h */

import { MaterialChecklist } from "../../design-system/components/icons.tsx";
import { h, t, focusOnElement } from "../index.ts";
import { SlashMenuExtensionPlugin } from "../slash-menu/index.ts";
import { TodoList } from "./components/todo-list.tsx";

export class SlashMenuTodoListExtensionPlugin extends SlashMenuExtensionPlugin {

    icon: SVGElement;
    label: string;
    sort: number;
    synonyms: string[];

    constructor() {
        super();
        this.icon = <MaterialChecklist />
        this.label = t("todo_list");
        this.sort = 99;
        this.synonyms = [t("list"), t("checkbox"), t("todo")];
    }

    onSelect(focusedBlock: HTMLElement): void {
        const element = <TodoList class="block" />;
        focusedBlock.after(element);
        const span = element.querySelector("span");
        focusOnElement(span);
    }
}