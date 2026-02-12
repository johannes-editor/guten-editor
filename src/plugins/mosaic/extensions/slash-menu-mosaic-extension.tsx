import { t } from "@core/i18n";
import { focusOnElement } from "@utils/dom";
import { ColumnsGapIcon } from "@components/ui/icons";
import { SlashMenuExtensionPlugin } from "@plugins/slash-menu";
import { MosaicBlock } from "../components/mosaic-block.tsx";

export class SlashMenuMosaicExtension extends SlashMenuExtensionPlugin {

    icon: SVGElement;
    label: string;
    sort: number;
    override synonyms: string[];

    constructor() {
        super();
        this.icon = <ColumnsGapIcon />;
        this.label = t("mosaic");
        this.sort = 98;
        this.synonyms = ["pinterest", "pin", "grid"];
    }

    override onSelect(focusedBlock: HTMLElement): void {
        const element = <MosaicBlock />;
        focusedBlock.after(element);
        focusOnElement(element);
    }
}