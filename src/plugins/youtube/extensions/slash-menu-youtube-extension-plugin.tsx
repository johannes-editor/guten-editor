/** @jsx h */

import { icons, h, t, focusOnElement } from "../../index.ts";
import { SlashMenuExtensionPlugin } from "../../slash-menu/index.ts";
import { YouTubePlaceholder } from "../components/youtube-placeholder.tsx";


export class SlashMenuYouTubeExtensionPlugin extends SlashMenuExtensionPlugin {

    icon: SVGElement;
    label: string;
    sort: number;
    synonyms?: string[];

    constructor() {
        super();
        this.icon = <icons.YouTubeIcon />;
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