import { runCommand } from "@core/command";
import { t } from "@core/i18n";
import { ImageUpIcon } from "@components/ui/icons";
import { ensureBlockId } from "@utils/dom";

const MOSAIC_COLUMN_COUNT = 3;
const DEFAULT_TILE_RATIO = 4 / 3;

const MOSAIC_BLOCK_STYLE_ID = "guten-mosaic-block-styles";
const TILE_RESERVED_DATASET_KEYS = new Set(["mosaicTile", "imageSource", "imageAlt", "mosaicImage"]);

const MOSAIC_BLOCK_STYLES = /*css*/`
    .mosaic-block {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: var(--space-sm);
        margin: var(--space-sm) 0;
    }

    .mosaic-block__column {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        min-width: 0;
    }

    .mosaic-block__tile {
        border: 0;
        border-radius: var(--radius-md);
        background: var(--placeholder-bg);
        cursor: pointer;
        overflow: hidden;
        position: relative;
        padding: 0;
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
        aspect-ratio: var(--mosaic-tile-ratio, 4/3);
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
        height: auto;
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

    img.onload = () => {
        const width = img?.naturalWidth ?? 0;
        const height = img?.naturalHeight ?? 0;
        if (!width || !height) return;

        tile.style.setProperty("--mosaic-tile-ratio", `${width} / ${height}`);
        tile.dataset.mosaicTileRatio = String(width / height);
    };

    img.src = src;
    img.alt = alt ?? "";
    img.draggable = false;
}

function getTileRatio(tile: HTMLElement): number {
    const value = Number.parseFloat(tile.dataset.mosaicTileRatio ?? "");
    if (!Number.isFinite(value) || value <= 0) return DEFAULT_TILE_RATIO;
    return value;
}

function getColumnHeightScore(column: HTMLElement): number {
    const tiles = column.querySelectorAll<HTMLElement>(".mosaic-block__tile");
    let totalHeight = 0;

    for (const tile of Array.from(tiles)) {
        totalHeight += 1 / getTileRatio(tile);
    }

    return totalHeight;
}

function getOrCreateColumns(block: HTMLElement): HTMLElement[] {
    const existingColumns = Array.from(block.querySelectorAll<HTMLElement>(":scope > .mosaic-block__column"));
    if (existingColumns.length === MOSAIC_COLUMN_COUNT) {
        return existingColumns;
    }

    const columns = Array.from({ length: MOSAIC_COLUMN_COUNT }, () => (
        <div className="mosaic-block__column" data-mosaic-column="true"></div>
    ) as HTMLElement);

    const tiles = Array.from(block.querySelectorAll<HTMLElement>(":scope > .mosaic-block__tile"));
    block.innerHTML = "";

    for (const column of columns) {
        block.appendChild(column);
    }

    for (const [index, tile] of tiles.entries()) {
        columns[index % MOSAIC_COLUMN_COUNT].appendChild(tile);
    }

    return columns;
}

function getColumnWithMostSpace(block: HTMLElement): HTMLElement {
    const columns = getOrCreateColumns(block);
    return columns.reduce((smallest, current) => {
        if (getColumnHeightScore(current) < getColumnHeightScore(smallest)) {
            return current;
        }

        return smallest;
    }, columns[0]);
}

function createDefaultTile(tileId: string): HTMLElement {
    const tile = (
        <div
            className="mosaic-block__tile"
            data-mosaic-tile={tileId}
            data-mosaic-tile-ratio={String(DEFAULT_TILE_RATIO)}
            style="--mosaic-tile-ratio: 4 / 3"
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

    return tile;
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

export function createMosaicTile(block: HTMLElement): HTMLElement {
    const tile = createDefaultTile(getNextMosaicTileId(block));
    getColumnWithMostSpace(block).appendChild(tile);
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
            <div className="mosaic-block__column" data-mosaic-column="true">{createDefaultTile("1")}</div>
            <div className="mosaic-block__column" data-mosaic-column="true">{createDefaultTile("2")}</div>
            <div className="mosaic-block__column" data-mosaic-column="true">{createDefaultTile("3")}</div>
        </figure>
    );
}