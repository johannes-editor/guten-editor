/** @jsx h */

import { t } from "@core/i18n";
import { h } from "@core/jsx";
import { GridIcon } from "@components/ui/icons";
import { focusOnElement, } from "@utils/dom";
import { SlashMenuExtensionPlugin } from "@plugin/slash-menu";
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