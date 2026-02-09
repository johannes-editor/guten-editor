import { t } from "@core/i18n";
import { YouTubeIcon } from "@components/ui/icons";
import { focusOnElement } from "@utils/dom";
import { SlashMenuExtensionPlugin } from "@plugins/slash-menu";
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