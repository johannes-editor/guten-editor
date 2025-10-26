/** @jsx h */

import { CardImageIcon } from "../../../design-system/components/icons.tsx";
import { BlockObjectPlaceholderUI } from "../../../design-system/components/block-object-placeholder-ui.tsx";
import { ensureBlockId } from "../../../utils/dom/block.ts";
import { h, runCommand, t } from "../../index.ts";


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