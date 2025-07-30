/** @jsx h */

import { h } from "../../jsx.ts";
import { DomUtils } from "../../utils/dom-utils.ts";
import { TodoList } from "./components/todo-list.tsx";
import { registerTranslation, t } from "../index.ts";
import en from "./i18n/en.ts";
import pt from "./i18n/pt.ts";
import { SlashMenuExtensionPlugin } from "../slash-menu/slash-menu-plugin.tsx";
import { Plugin } from "../index.ts";

export class SlashMenuTodoListPluginExtension extends SlashMenuExtensionPlugin {
    
    sort: number = 9;
    range: Range | null = null;

    label: string = "";
    synonyms: string[] = [];

    override setup(_root: HTMLElement, _plugins: Plugin[]): void {

        registerTranslation("en", en);
        registerTranslation("pt", pt);

        this.label = t("todo_list");
        this.synonyms = [t("list"), t("checkbox"), t("todo")];
    }

    onSelect(focusedBlock: HTMLElement): void {
        const element = <TodoList class="block" />;
        focusedBlock.after(element);
        const span = element.querySelector("span");
        DomUtils.focusOnElement(span);
    }
}