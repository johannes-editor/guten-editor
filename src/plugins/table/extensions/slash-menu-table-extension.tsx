/** @jsx h */

import { GridIcon } from "../../../design-system/components/icons.tsx";
import { h, t, focusOnElement, } from "../../index.ts";
import { SlashMenuExtensionPlugin } from "../../slash-menu/index.ts";
import { TableBlock } from "../components/table-block.tsx";

export class SlashMenuTableExtension extends SlashMenuExtensionPlugin {

    icon: SVGElement;
    label: string;
    sort: number;

    constructor() {

        super();
        this.label = t("table");
        this.icon = <GridIcon />;
        this.sort = 99;
    }

    onSelect(focusedBlock: HTMLElement): void {
        const element = <TableBlock />;
        focusedBlock.after(element);
        const cell = element.querySelector("td");
        focusOnElement(cell);
    }
}