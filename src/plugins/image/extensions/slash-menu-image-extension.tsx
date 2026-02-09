import { t } from "@core/i18n";
import { CardImageIcon } from "@components/ui/icons"
import { focusOnElement } from "@utils/dom";
import { SlashMenuExtensionPlugin } from "@plugins/slash-menu";
import { ImagePlaceholder } from "../components/image-placeholder.tsx";

export class SlashMenuImageExtension extends SlashMenuExtensionPlugin {

    icon: SVGElement;
    label: string;
    sort: number;
    override synonyms: string[];

    constructor() {
        super();
        this.icon = <CardImageIcon />;
        this.label = t("image");
        this.sort = 99;
        this.synonyms = [t("photo"), t("picture"), t("img")];
    }

    override onSelect(focusedBlock: HTMLElement): void {
        const element = <ImagePlaceholder />;
        focusedBlock.after(element);
        focusOnElement(element);
    }
}