import { t } from "@core/i18n";
import { GridColumnLeftFilledIcon } from "@components/ui/icons";
import { SlashMenuExtensionPlugin } from "@plugins/slash-menu";
import { MasonryGalleryBlock } from "../components/masonry-gallery.tsx";
import { clearSelection } from "@utils/selection";

export class SlashMenuMasonryExtension extends SlashMenuExtensionPlugin {

    icon: SVGElement;
    label: string;
    sort: number;
    override synonyms: string[];

    constructor() {
        super();
        this.icon = <GridColumnLeftFilledIcon />;
        this.label = t("masonry_gallery");
        this.sort = 98;
        this.synonyms = ["pinterest", "pin", "grid", t("mosaic"), t("photo"), t("picture"), t("img")];
    }

    override onSelect(focusedBlock: HTMLElement): void {
        const element = <MasonryGalleryBlock />;
        focusedBlock.after(element);
        
        requestAnimationFrame(() => {
            clearSelection();
            (document.activeElement as HTMLElement | null)?.blur?.();
        });
    }
}