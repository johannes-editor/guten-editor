/** @jsx h */

import { focusOnElement, h, icons, t } from "../../index.ts";
import { SlashMenuExtensionPlugin } from "../../slash-menu/index.ts";
import { ImagePlaceholder } from "../components/image-placeholder.tsx";

export class SlashMenuImageExtension extends SlashMenuExtensionPlugin {

    icon: SVGElement;
    label: string;
    sort: number;
    override synonyms: string[];

    constructor() {
        super();
        this.icon = <icons.CardImageIcon />;
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