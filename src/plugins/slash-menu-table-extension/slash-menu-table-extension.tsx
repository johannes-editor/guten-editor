/** @jsx h */
import { h } from "../../jsx.ts";
import { SlashMenuPluginExtension, SlashMenuPluginExtensionType } from "../slash-menu/slash-menu-plugin.tsx";
import { Plugin } from "../../core/plugin-engine/plugin.ts";
import { CustomTableFn } from "./components/custom-table-fn.tsx";
import { DomUtils, registerTranslation, t } from "../index.ts";
import { en } from "./i18n/en.ts";
import { pt } from "./i18n/pt.ts";

export class SlashMenuTablePluginExtension extends Plugin implements SlashMenuPluginExtension {

    sort: number = 9;
    range: Range | null = null;
    /**
     * Discriminator used by the system to identify this plugin as a SlashMenu extension.
     * Must be set to `SlashMenuPluginExtensionType`.
     */
    public readonly type = SlashMenuPluginExtensionType;

    label: string;

    constructor() {
        super();

        registerTranslation("en", en);
        registerTranslation("pt", pt);

        this.label = t("table");
    }

    onSelect(): void {

        const currentBlock = DomUtils.findClosestAncestorOfSelectionByClass("block");

        if (currentBlock) {
            const element = DomUtils.insertElementAfter(currentBlock, <CustomTableFn />);
            const cell = element.querySelector("td");
            DomUtils.focusOnElement(cell);
        }
    }

    override setup(_root: HTMLElement, _plugins: Plugin[]): void {
        // No setup required for this extension plugin.
    }
}