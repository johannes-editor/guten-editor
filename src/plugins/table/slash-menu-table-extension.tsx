/** @jsx h */

import { h } from "../../jsx.ts";
import { SlashMenuExtensionPlugin } from "../slash-menu/slash-menu-plugin.tsx";
import { Plugin } from "../../core/plugin-engine/plugin.ts";
import { CustomTableFn } from "./components/custom-table-fn.tsx";
import { DomUtils, registerTranslation, t } from "../index.ts";
import { en } from "./i18n/en.ts";
import { pt } from "./i18n/pt.ts";

export class SlashMenuTablePluginExtension extends SlashMenuExtensionPlugin {

    sort: number = 9;
    range: Range | null = null;

    label: string = "";

    // constructor() {
    //     super();

    //     registerTranslation("en", en);
    //     registerTranslation("pt", pt);

    //     this.label = t("table");
    // }

    onSelect(focusedBlock: HTMLElement): void {
        const element = <CustomTableFn />;
        focusedBlock.after(element);
        const cell = element.querySelector("td");
        DomUtils.focusOnElement(cell);
    }

    // override setup(_root: HTMLElement, _plugins: Plugin[]): void {
    //     // No setup required for this extension plugin.

    //     registerTranslation("en", en);
    //     registerTranslation("pt", pt);

    //     this.label = t("table");
    // }
}