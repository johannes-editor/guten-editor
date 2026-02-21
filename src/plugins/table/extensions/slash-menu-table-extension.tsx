import { t } from "@core/i18n";
import { TableIcon } from "@components/ui/icons";
import { focusOnElement, } from "@utils/dom";
import { SlashMenuExtensionPlugin } from "@plugins/slash-menu";
import { TableBlock } from "../components/table-block.tsx";

export class SlashMenuTableExtension extends SlashMenuExtensionPlugin {

    icon: SVGElement;
    label: string;
    sort: number;
    override shortcut?: string | undefined;

    constructor() {

        super();
        this.label = t("table");
        this.icon = <TableIcon />;
        this.shortcut = "|| x y";
        this.sort = 99;
    }

    onSelect(focusedBlock: HTMLElement): void {
        const element = <TableBlock />;
        focusedBlock.after(element);
        const cell = element.querySelector("td");
        focusOnElement(cell);
    }
}