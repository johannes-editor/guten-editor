/** @jsx h */

import { h } from "@core/jsx/index.ts";
import { t } from "@core/i18n/index.ts";
import { runCommand } from "@core/command/index.ts";
import { CardImageIcon } from "@components/ui/primitives/icons.tsx";
import { BlockObjectPlaceholderUI } from "@components/ui/primitives/placeholder/block-object-placeholder-ui.tsx";
import { ensureBlockId } from "@utils/dom/index.ts";

export class ImagePlaceholder extends BlockObjectPlaceholderUI {

    private autoOpenScheduled = false;

    constructor() {
        super(<CardImageIcon />, t("insert_image"));
    }

    override onMount(): void {
        this.dataset.imagePlaceholder = "true";
        ensureBlockId(this);

        if (this.autoOpenScheduled) return;
        this.autoOpenScheduled = true;

        requestAnimationFrame(() => this.openMenu());
    }

    override onClick(): void {
        this.openMenu();
    }

    private openMenu(): void {
        const rect = this.getBoundingClientRect();

        runCommand("openImageMenu", {
            content: {
                target: this,
                anchorRect: rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : undefined,
            },
        });
    }
}