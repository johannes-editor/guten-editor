/** @jsx h */

import { h } from "@core/jsx/index.ts";
import { t } from "@core/i18n/index.ts";
import { runCommand } from "@core/command/index.ts";
import { YouTubeIcon } from "@components/ui/primitives/icons.tsx";
import { BlockObjectPlaceholderUI } from "@components/ui/primitives/placeholder/block-object-placeholder-ui.tsx";

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