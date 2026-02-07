/** @jsx h */

import { h } from "@core/jsx/index.ts";
import { t } from "@core/i18n/index.ts";
import { YouTubeIcon } from "@components/ui/primitives/icons.tsx";
import { focusOnElement } from "@utils/dom/index.ts";
import { SlashMenuExtensionPlugin } from "@plugin/slash-menu/index.ts";
import { YouTubePlaceholder } from "../components/youtube-placeholder.tsx";


export class SlashMenuYouTubeExtensionPlugin extends SlashMenuExtensionPlugin {

    icon: SVGElement;
    label: string;
    sort: number;
    override synonyms?: string[];

    constructor() {
        super();
        this.icon = <YouTubeIcon />;
        this.label = t("youtube");
        this.sort = 110;
        this.synonyms = ["youtube", "video", "short", "shorts", "playlist"];
    }

    override onSelect(focusedBlock: HTMLElement): void {
        const placeholder = <YouTubePlaceholder />;
        focusedBlock.after(placeholder);
        focusOnElement(placeholder);
    }
}