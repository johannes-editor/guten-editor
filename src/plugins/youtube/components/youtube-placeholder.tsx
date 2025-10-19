/** @jsx h */

import { YouTubeIcon } from "../../../design-system/components/icons.tsx";
import { BlockObjectPlaceholderUI } from "../../../design-system/components/block-object-placeholder-ui.tsx";
import { h, runCommand, t } from "../../index.ts";

export class YouTubePlaceholder extends BlockObjectPlaceholderUI {

    private autoOpenScheduled = false;

    constructor() {
        super(<YouTubeIcon />, t("insert_youtube"));
    }

    override onMount(): void {
        this.dataset.youtubePlaceholder = "true";
        if (this.autoOpenScheduled) return;
        this.autoOpenScheduled = true;
        requestAnimationFrame(() => this.openPopover());
    }

    override onClick(): void {
        this.openPopover();
    }

    private openPopover(): void {
        const rect = this.getBoundingClientRect();
        runCommand("openYouTubePopover", {
            content: {
                target: this,
                anchorRect: rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : undefined,
            },
        });
    }
}