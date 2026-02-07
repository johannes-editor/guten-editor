/** @jsx h */

import { t } from "@core/i18n/index.ts";
import { h } from "@core/jsx/index.ts";
import { GridIcon } from "@components/ui/primitives/icons.tsx";
import { focusOnElement, } from "@utils/dom/index.ts";
import { SlashMenuExtensionPlugin } from "@plugin/slash-menu/index.ts";
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