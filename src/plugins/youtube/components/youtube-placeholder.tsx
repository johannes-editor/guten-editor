/** @jsx h */

import { h } from "@core/jsx";
import { t } from "@core/i18n";
import { runCommand } from "@core/command";
import { YouTubeIcon } from "@components/ui/icons";
import { BlockObjectPlaceholderUI } from "@components/ui/primitives/placeholder";

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