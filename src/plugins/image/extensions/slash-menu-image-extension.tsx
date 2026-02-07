/** @jsx h */

import { h } from "@core/jsx/dom-factory.ts";
import { t } from "@core/i18n/index.ts";
import { CardImageIcon } from "@components/ui/primitives/icons.tsx"
import { focusOnElement } from "@utils/dom/index.ts";
import { SlashMenuExtensionPlugin } from "@plugin/slash-menu/index.ts";
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