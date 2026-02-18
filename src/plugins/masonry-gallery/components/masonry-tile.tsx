import { generateShortId, injectStyleOnce } from "@utils/dom";
import { runCommand } from "@core/command";
import { ImageAltIcon } from "@components/ui/icons";
import { t } from "@core/i18n";

const MASONRY_TILE_STYLES = /*css*/`
    .masonry-gallery__tile {
        border: 0;
        border-radius: var(--radius-md);
        background: var(--placeholder-bg);
        cursor: pointer;
        overflow: hidden;
        position: relative;
        padding: 0;
        min-height: 0;
    }

    .masonry-gallery__tile[draggable="true"] {
        cursor: grab;
    }

    .masonry-gallery__tile[data-mosaic-dragging="true"] {
        opacity: 0.45;
    }

    .masonry-gallery__tile[data-mosaic-drop-target="true"] {
        outline: 2px dashed var(--focus-ring-color);
        outline-offset: 1px;
    }

    .masonry-gallery__tile-content {
        display: flex;
        width: 100%;
        aspect-ratio: var(--mosaic-tile-ratio, 4/3);
        color: var(--color-muted);
        align-items: center;
        justify-content: center;
    }

    .masonry-gallery__tile-content svg {
        width: 24px;
        height: 24px;
    }

    .masonry-gallery__tile img {
        display: block;
        width: 100%;
        height: auto;
        user-select: none;
        pointer-events: none;
    }
`;


export function MasonryTile(): HTMLDivElement {

    injectStyleOnce("guten:masonry-tile", MASONRY_TILE_STYLES);

    const tileId = generateShortId();

    return (
        <div
            className="masonry-gallery__tile"
            data-mosaic-tile={tileId}
            data-mosaic-tile-ratio="4 / 3"
            draggable="true"
            role="button"
            tabIndex={0}
            onClick={(event: MouseEvent) => {
                event.preventDefault();
                if (event.detail !== 2) return;
                openTileImageMenu(event.currentTarget as HTMLElement);
            }}
            onKeyDown={(event: KeyboardEvent) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                openTileImageMenu(event.currentTarget as HTMLElement);
            }}
        >
            <span className="masonry-gallery__tile-content" title={t("insert_image")}><ImageAltIcon /></span>
        </div>
    );
}

function openTileImageMenu(tile: HTMLElement): void {
    const rect = tile.getBoundingClientRect();

    runCommand("openMasonryImageMenu", {
        content: {
            target: tile,
            anchorRect: rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : undefined,
        },
    });
}