import { runCommand } from "@core/command";
import { t } from "@core/i18n";
import { ImageUpIcon } from "@components/ui/icons";
import { ensureBlockId } from "@utils/dom";

const MOSAIC_BLOCK_STYLE_ID = "guten-mosaic-block-styles";
const TILE_RESERVED_DATASET_KEYS = new Set(["mosaicTile", "imageSource", "imageAlt", "mosaicImage"]);

const MOSAIC_BLOCK_STYLES = /*css*/`
    .mosaic-block {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: var(--space-sm);
        margin: var(--space-sm) 0;
    }

    .mosaic-block__tile {
        border: 0;
        border-radius: var(--radius-md);
        background: var(--placeholder-bg);
        cursor: pointer;
        overflow: hidden;
        position: relative;
        padding: 0;
        height: 100%;
        min-height: 0;
    }

    .mosaic-block__tile--tall {
        grid-row: span 28;
    }

    .mosaic-block__tile--short {
        grid-row: span 19;
    }

    .mosaic-block__tile--mid {
        grid-row: span 23;
    }

    .mosaic-block__tile-content {
        display: flex;
        width: 100%;
        height: 100%;
        color: var(--color-muted);
        align-items: center;
        justify-content: center;
    }

    .mosaic-block__tile-content svg {
        width: 24px;
        height: 24px;
    }

    .mosaic-block__tile img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        user-select: none;
        pointer-events: none;
    }
`;

function ensureMosaicStyles(): void {
    if (typeof document === "undefined") return;
    if (document.getElementById(MOSAIC_BLOCK_STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = MOSAIC_BLOCK_STYLE_ID;
    style.textContent = MOSAIC_BLOCK_STYLES;
    document.head.appendChild(style);
}

function openTileImageMenu(tile: HTMLElement): void {
    const rect = tile.getBoundingClientRect();

    runCommand("openMosaicImageMenu", {
        content: {
            target: tile,
            anchorRect: rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : undefined,
        },
    });
}

function clearTileDataset(tile: HTMLElement): void {
    for (const key of Object.keys(tile.dataset)) {
        if (TILE_RESERVED_DATASET_KEYS.has(key)) continue;
        delete (tile.dataset as Record<string, string | undefined>)[key];
    }
}

function renderTileImage(tile: HTMLElement, src: string, alt?: string): void {
    tile.dataset.imageSource = src;
    if (alt) {
        tile.dataset.imageAlt = alt;
    } else {
        delete tile.dataset.imageAlt;
    }

    tile.dataset.mosaicImage = "true";

    const iconContainer = tile.querySelector<HTMLElement>(".mosaic-block__tile-content");
    iconContainer?.remove();

    let img = tile.querySelector<HTMLImageElement>("img");
    if (!img) {
        img = document.createElement("img");
        tile.appendChild(img);
    }

    img.src = src;
    img.alt = alt ?? "";
    img.draggable = false;
}

export type MosaicTileImagePayload = {
    target: HTMLElement;
    sourceUrl: string;
    alt?: string;
    dataset?: Record<string, string>;
};

export function applyMosaicTileImage(payload: MosaicTileImagePayload): boolean {
    const tile = payload.target;

    if (!tile?.dataset?.mosaicTile) return false;
    if (!payload.sourceUrl) return false;

    clearTileDataset(tile);

    if (payload.dataset) {
        for (const [key, value] of Object.entries(payload.dataset)) {
            if (!value || TILE_RESERVED_DATASET_KEYS.has(key)) continue;
            tile.dataset[key] = value;
        }
    }

    renderTileImage(tile, payload.sourceUrl, payload.alt);
    return true;
}

function getNextMosaicTileId(block: HTMLElement): string {
    const tiles = block.querySelectorAll<HTMLElement>(".mosaic-block__tile[data-mosaic-tile]");
    let maxTileId = 0;

    for (const tile of Array.from(tiles)) {
        const tileId = Number.parseInt(tile.dataset.mosaicTile ?? "", 10);
        if (!Number.isNaN(tileId)) {
            maxTileId = Math.max(maxTileId, tileId);
        }
    }

    return String(maxTileId + 1);
}

export function createMosaicTile(block: HTMLElement, size: "tall" | "short" | "mid" = "mid"): HTMLElement {
    const tile = (
        <div
            className={`mosaic-block__tile mosaic-block__tile--${size}`}
            data-mosaic-tile={getNextMosaicTileId(block)}
            role="button"
            tabIndex={0}
            onClick={(event: MouseEvent) => {
                event.preventDefault();
                openTileImageMenu(event.currentTarget as HTMLElement);
            }}
            onKeyDown={(event: KeyboardEvent) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                openTileImageMenu(event.currentTarget as HTMLElement);
            }}
        >
            <span className="mosaic-block__tile-content" title={t("insert_image")}><ImageUpIcon style="opacity: 0.4" /></span>
        </div>
    ) as HTMLElement;

    block.appendChild(tile);
    return tile;
}



export function MosaicBlock() {
    ensureMosaicStyles();

    return (
        <figure
            className="block mosaic-block"
            contenteditable="false"
            ref={(element: HTMLElement | null) => {
                if (!element) return;
                ensureBlockId(element);
            }}
        >
            <div className="mosaic-block__tile mosaic-block__tile--tall" data-mosaic-tile="1" role="button" tabIndex={0} onClick={(event: MouseEvent) => {
                event.preventDefault();
                openTileImageMenu(event.currentTarget as HTMLElement);
            }} onKeyDown={(event: KeyboardEvent) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                openTileImageMenu(event.currentTarget as HTMLElement);
            }}>
                <span className="mosaic-block__tile-content" title={t("insert_image")}><ImageUpIcon  style="opacity: 0.4"/></span>
            </div>

                       
            <div className="mosaic-block__tile mosaic-block__tile--short" data-mosaic-tile="2" role="button" tabIndex={0} onClick={(event: MouseEvent) => {
                event.preventDefault();
                openTileImageMenu(event.currentTarget as HTMLElement);
            }} onKeyDown={(event: KeyboardEvent) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                openTileImageMenu(event.currentTarget as HTMLElement);
            }}>
                <span className="mosaic-block__tile-content" title={t("insert_image")}><ImageUpIcon style="opacity: 0.4" /></span>
            </div>

            <div className="mosaic-block__tile mosaic-block__tile--mid" data-mosaic-tile="3" role="button" tabIndex={0} onClick={(event: MouseEvent) => {
                event.preventDefault();
                openTileImageMenu(event.currentTarget as HTMLElement);
            }} onKeyDown={(event: KeyboardEvent) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                openTileImageMenu(event.currentTarget as HTMLElement);
            }}>
                <span className="mosaic-block__tile-content" title={t("insert_image")}><ImageUpIcon style="opacity: 0.4" /></span>
            </div>

            
        </figure>
    );
}