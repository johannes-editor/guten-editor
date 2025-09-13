/** @jsx h */

import { CardImageIcon } from "../../design-system/components/icons.tsx";
import { focusOnElement, h, t } from "../index.ts";
import { SlashMenuExtensionPlugin } from "../slash-menu/index.ts";
import { ImagePlaceholder } from "./components/image-placeholder.tsx";

export class SlashMenuImageExtensionPlugin extends SlashMenuExtensionPlugin {

    icon: SVGElement;
    label: string;
    sort: number;
    synonyms: string[];

    constructor() {
        super();
        this.icon = <CardImageIcon />
        this.label = t("image");
        this.sort = 99;
        this.synonyms = [t("photo"), t("picture"), t("img")];
    }

    onSelect(focusedBlock: HTMLElement): void {
        const element = <ImagePlaceholder />;
        focusedBlock.after(element);
        focusOnElement(element);
    }
}