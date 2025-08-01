/** @jsx h */

import { h, t, focusOnElement, } from "../index.ts";
import { SlashMenuExtensionPlugin } from "../slash-menu/index.ts";
import { TableBlock } from "./components/table-block.tsx";

export class SlashMenuTableExtensionPlugin extends SlashMenuExtensionPlugin {

    sort: number;
    label: string;

    constructor() {
        super();
        this.sort = 9;
        this.label = t("table");
    }

    onSelect(focusedBlock: HTMLElement): void {
        const element = <TableBlock />;
        focusedBlock.after(element);
        const cell = element.querySelector("td");
        focusOnElement(cell);
    }
}