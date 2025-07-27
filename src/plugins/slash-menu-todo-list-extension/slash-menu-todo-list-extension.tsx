/** @jsx h */
import { h } from "../../jsx.ts";
import { SlashMenuPluginExtension, SlashMenuPluginExtensionType } from "../slash-menu/slash-menu-plugin.tsx";
import { Plugin } from "../../core/plugin-engine/plugin.ts";
import { DomUtils } from "../../utils/dom-utils.ts";
import { DataSkip } from "../../constants/data-skip.ts";
import { ClassName } from "../../constants/class-name.ts";
import { TodoList } from "./components/todo-list.tsx";
import { registerTranslation, t } from "../index.ts";
import en from "./i18n/en.ts";
import pt from "./i18n/pt.ts";

export class SlashMenuTodoListPluginExtension extends Plugin implements SlashMenuPluginExtension {

    sort: number = 9;
    range: Range | null = null;
    /**
     * Discriminator used by the system to identify this plugin as a SlashMenu extension.
     * Must be set to `SlashMenuPluginExtensionType`.
     */
    public readonly type = SlashMenuPluginExtensionType;

    label: string;
    synonyms: string[];

    constructor() {
        super();

        registerTranslation("en", en);
        registerTranslation("pt", pt);

        this.label = t("todo_list");
        this.synonyms = [t("list"), t("checkbox"), t("todo")];
    }

    onSelect(): void {

        const block = DomUtils.findClosestAncestorOfSelectionByClass("block");

        if (block) {
            const element = DomUtils.insertElementAfter(block, <TodoList class={ClassName.Block} data-skip={DataSkip.BlockInsertionNormalizer} />);
            const span = element.querySelector("span");
            DomUtils.focusOnElement(span);
        }
    }

    override setup(_root: HTMLElement): void {
        // No setup required for this extension plugin.
    }
}