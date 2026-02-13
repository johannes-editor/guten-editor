import { t } from "@core/i18n";
import { ImagePlusIcon } from "@components/ui/icons";
import { BlockOptionsExtensionPlugin, BlockOptionsItem } from "@plugins/block-controls";
import { createMosaicTile } from "../components/mosaic-block.tsx";



export class BlockOptionsMosaicExtension extends BlockOptionsExtensionPlugin {
    override items(block: HTMLElement): BlockOptionsItem[] {
        if (!block.classList.contains("mosaic-block")) return [];

        return [
            {
                id: "mosaic-add-image",
                icon: <ImagePlusIcon />,
                label: t("mosaic_add_image"),
                sort: 55,
                onSelect: (ctx) => {
                    createMosaicTile(ctx.block, "mid");
                },
            },
        ];
    }
}