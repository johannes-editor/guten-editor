import { t } from "@core/i18n";
import { runCommand } from "@core/command";
import { ImageFillIcon } from "@components/ui/icons";
import { BlockObjectPlaceholderUI } from "@components/ui/primitives/placeholder";
import { ensureBlockId } from "@utils/dom";

export class ImagePlaceholder extends BlockObjectPlaceholderUI {

    private autoOpenScheduled = false;

    constructor() {
        super(<ImageFillIcon />, t("insert_image"));
    }

    override onMount(): void {
        this.dataset.imagePlaceholder = "true";
        ensureBlockId(this);

        if (this.autoOpenScheduled) return;
        this.autoOpenScheduled = true;

        requestAnimationFrame(() => this.openMenu());
    }

    override onSelect(_event: MouseEvent): void {
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