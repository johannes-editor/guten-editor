import { t } from "@core/i18n";
import { LayoutPlusIcon } from "@components/ui/icons";
import { BlockOptionsExtensionPlugin, BlockOptionsItem } from "@plugins/block-controls";
import { createMosaicTile } from "../components/masonry-gallery.tsx";

export class BlockOptionsMosaicExtension extends BlockOptionsExtensionPlugin {
    override items(block: HTMLElement): BlockOptionsItem[] {
        if (!block.classList.contains("masonry-gallery")) return [];

        return [
            {
                id: "mosaic-add-image",
                icon: <LayoutPlusIcon />,
                label: t("mosaic_add_image"),
                sort: 55,
                onSelect: (ctx) => {
                    createMosaicTile(ctx.block);
                },
            },
        ];
    }
}