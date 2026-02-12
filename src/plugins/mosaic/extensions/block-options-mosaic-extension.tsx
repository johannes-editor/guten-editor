import { t } from "@core/i18n";
import { runCommand } from "@core/command";
import { ImagePlusIcon } from "@components/ui/icons";
import { BlockOptionsExtensionPlugin, BlockOptionsItem } from "@plugins/block-controls";

function findNextAvailableTile(block: HTMLElement): HTMLElement | null {
    const tiles = block.querySelectorAll<HTMLElement>(".mosaic-block__tile[data-mosaic-tile]");
    for (const tile of Array.from(tiles)) {
        if (!tile.dataset.imageSource) {
            return tile;
        }
    }

    return null;
}

export class BlockOptionsMosaicExtension extends BlockOptionsExtensionPlugin {
    override items(block: HTMLElement): BlockOptionsItem[] {
        if (!block.classList.contains("mosaic-block")) return [];

        return [
            {
                id: "mosaic-add-image",
                icon: <ImagePlusIcon />,
                label: t("mosaic_add_image"),
                sort: 55,
                isVisible: (ctxBlock) => findNextAvailableTile(ctxBlock) !== null,
                onSelect: (ctx) => {
                    const targetTile = findNextAvailableTile(ctx.block);
                    if (!targetTile) return;

                    const rect = targetTile.getBoundingClientRect();
                    runCommand("openMosaicImageMenu", {
                        content: {
                            target: targetTile,
                            anchorRect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
                        },
                    });
                },
            },
        ];
    }
}