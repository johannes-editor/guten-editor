
import { generateBlockId, injectStyleOnce } from "@utils/dom";
import { applyImageSourceToElement, saveLocalImage } from "@utils/media";
import { MasonryGrid } from "./masonry-grid.tsx";
import { MasonryTile } from "./masonry-tile.tsx";

const MOSAIC_COLUMN_COUNT = 3;
const DEFAULT_TILE_RATIO = 4 / 3;

const TILE_RESERVED_DATASET_KEYS = new Set(["mosaicTile", "imageSource", "imageAlt", "mosaicImage"]);

const MOSAIC_BLOCK_STYLES = /*css*/`
    .masonry-gallery {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        margin: var(--space-sm) 0;
    }

    .masonry-gallery__add-tile {
        display: flex;
        justify-content: center;
        opacity: 0;
        transform: translateY(-2px);
        transition: opacity 160ms ease, transform 160ms ease;
        pointer-events: none;
    }

    .masonry-gallery:hover .masonry-gallery__add-tile,
    .masonry-gallery:focus-within .masonry-gallery__add-tile {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
    }
`;

function getTileWeight(tile: HTMLElement): number {
    return 1 / getTileRatio(tile);
}


function getColumnInsertReference(column: HTMLElement, draggedTile: HTMLElement, clientY: number): HTMLElement | null {
    const tiles = Array.from(column.querySelectorAll<HTMLElement>(":scope > .masonry-gallery__tile"))
        .filter((tile) => tile !== draggedTile);

    for (const tile of tiles) {
        const rect = tile.getBoundingClientRect();
        const midpoint = rect.top + (rect.height / 2);
        if (clientY < midpoint) {
            return tile;
        }
    }

    return null;
}

function clearDropHighlights(block: HTMLElement): void {
    const highlighted = block.querySelectorAll<HTMLElement>("[data-mosaic-drop-target='true']");
    for (const element of Array.from(highlighted)) {
        delete element.dataset.mosaicDropTarget;
    }
}

function hasImageFiles(dataTransfer: DataTransfer | null): boolean {
    if (!dataTransfer) return false;

    for (const item of Array.from(dataTransfer.items ?? [])) {
        if (item.kind === "file" && item.type.startsWith("image/")) {
            return true;
        }
    }

    return Array.from(dataTransfer.files ?? []).some((file) => file.type.startsWith("image/"));
}

function getImageFilesFromFileList(files: FileList): File[] {
    return Array.from(files).filter((file) => file.type.startsWith("image/"));
}

function canMoveTileToColumn(
    columns: HTMLElement[],
    sourceColumn: HTMLElement,
    destinationColumn: HTMLElement,
    tile: HTMLElement,
): boolean {
    if (sourceColumn === destinationColumn) return true;

    const tileWeight = getTileWeight(tile);
    const sourceHeight = getColumnHeightScore(sourceColumn);
    const destinationHeight = getColumnHeightScore(destinationColumn);
    const currentTallest = Math.max(...columns.map((column) => getColumnHeightScore(column)));
    const projectedSourceHeight = sourceHeight - tileWeight;
    const projectedDestinationHeight = destinationHeight + tileWeight;

    if (projectedSourceHeight < 0) return false;
    return projectedDestinationHeight <= currentTallest + 0.0001;
}

function canSwapTilesBetweenColumns(
    columns: HTMLElement[],
    sourceColumn: HTMLElement,
    destinationColumn: HTMLElement,
    draggedTile: HTMLElement,
    targetTile: HTMLElement,
): boolean {
    if (!columns.length) return false;
    if (sourceColumn === destinationColumn) return false;
    if (draggedTile === targetTile) return false;

    return true;
}

function findFallbackSwapTile(
    columns: HTMLElement[],
    sourceColumn: HTMLElement,
    destinationColumn: HTMLElement,
    draggedTile: HTMLElement,
    preferredTile: HTMLElement | null,
): HTMLElement | null {
    const destinationTiles = Array.from(destinationColumn.querySelectorAll<HTMLElement>(":scope > .masonry-gallery__tile"));

    if (preferredTile && destinationTiles.includes(preferredTile)) {
        if (canSwapTilesBetweenColumns(columns, sourceColumn, destinationColumn, draggedTile, preferredTile)) {
            return preferredTile;
        }
    }

    for (const candidate of destinationTiles) {
        if (candidate === draggedTile) continue;
        if (canSwapTilesBetweenColumns(columns, sourceColumn, destinationColumn, draggedTile, candidate)) {
            return candidate;
        }
    }

    return null;
}

function swapTiles(draggedTile: HTMLElement, targetTile: HTMLElement): void {
    const sourceParent = draggedTile.parentElement;
    const targetParent = targetTile.parentElement;
    if (!sourceParent || !targetParent) return;

    const draggedNextSibling = draggedTile.nextSibling;
    const targetNextSibling = targetTile.nextSibling;

    if (sourceParent === targetParent) {
        const parent = sourceParent;
        if (draggedNextSibling === targetTile) {
            parent.insertBefore(targetTile, draggedTile);
            return;
        }

        if (targetNextSibling === draggedTile) {
            parent.insertBefore(draggedTile, targetTile);
            return;
        }

        parent.insertBefore(draggedTile, targetNextSibling);
        parent.insertBefore(targetTile, draggedNextSibling);
        return;
    }

    sourceParent.insertBefore(targetTile, draggedNextSibling);
    targetParent.insertBefore(draggedTile, targetNextSibling);
}

function setupMosaicTileDragAndDrop(block: HTMLElement): void {
    if (block.dataset.mosaicDndReady === "true") return;
    block.dataset.mosaicDndReady = "true";

    for (const tile of Array.from(block.querySelectorAll<HTMLElement>(".masonry-gallery__tile"))) {
        ensureTileIsDraggable(tile);
    }

    let draggedTile: HTMLElement | null = null;
    let sourceColumn: HTMLElement | null = null;

    block.addEventListener("dragstart", (event) => {
        const tile = (event.target as HTMLElement | null)?.closest<HTMLElement>(".masonry-gallery__tile");
        if (!tile || !block.contains(tile)) return;

        ensureTileIsDraggable(tile);

        draggedTile = tile;
        sourceColumn = tile.closest<HTMLElement>(".masonry-gallery__column");
        tile.dataset.mosaicDragging = "true";

        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", tile.dataset.mosaicTile ?? "mosaic-tile");
        }
    });

    block.addEventListener("dragover", (event) => {
        const target = event.target as HTMLElement | null;

        if (!draggedTile && hasImageFiles(event.dataTransfer)) {
            event.preventDefault();
            if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";

            clearDropHighlights(block);

            const targetTile = target?.closest<HTMLElement>(".masonry-gallery__tile");
            if (targetTile && block.contains(targetTile)) {
                targetTile.dataset.mosaicDropTarget = "true";
            }

            return;
        }

        if (!draggedTile || !sourceColumn) return;

        const targetTile = target?.closest<HTMLElement>(".masonry-gallery__tile");
        const targetColumn = target?.closest<HTMLElement>(".masonry-gallery__column");

        if (!targetColumn || !block.contains(targetColumn)) return;

        const columns = getOrCreateColumns(block);
        const canMove = canMoveTileToColumn(columns, sourceColumn, targetColumn, draggedTile);
        const swapTile = findFallbackSwapTile(
            columns,
            sourceColumn,
            targetColumn,
            draggedTile,
            targetTile && targetTile !== draggedTile ? targetTile : null,
        );
        const canSwap = Boolean(swapTile);

        if (!canMove && !canSwap) {
            if (event.dataTransfer) event.dataTransfer.dropEffect = "none";
            clearDropHighlights(block);
            return;
        }

        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = "move";

        clearDropHighlights(block);
        if (targetTile && targetTile !== draggedTile) {
            targetTile.dataset.mosaicDropTarget = "true";
        } else if (swapTile) {
            swapTile.dataset.mosaicDropTarget = "true";
        } else {
            targetColumn.dataset.mosaicDropTarget = "true";
        }
    });

    block.addEventListener("drop", (event) => {
        const target = event.target as HTMLElement | null;

        if (!draggedTile && hasImageFiles(event.dataTransfer)) {
            event.preventDefault();

            const targetTile = target?.closest<HTMLElement>(".masonry-gallery__tile");
            const dropTarget = targetTile && block.contains(targetTile) ? targetTile : null;
            clearDropHighlights(block);

            if (event.dataTransfer?.files?.length) {
                void insertDroppedImages(block, dropTarget, event.dataTransfer.files);
            }
            return;
        }

        if (!draggedTile || !sourceColumn) return;

        const targetColumn = target?.closest<HTMLElement>(".masonry-gallery__column");
        if (!targetColumn || !block.contains(targetColumn)) return;

        const columns = getOrCreateColumns(block);
        const targetTile = target?.closest<HTMLElement>(".masonry-gallery__tile");
        const canMove = canMoveTileToColumn(columns, sourceColumn, targetColumn, draggedTile);
        const swapTile = findFallbackSwapTile(
            columns,
            sourceColumn,
            targetColumn,
            draggedTile,
            targetTile && targetTile !== draggedTile ? targetTile : null,
        );
        const canSwap = Boolean(swapTile);

        if (!canMove && canSwap && swapTile) {
            swapTiles(draggedTile, swapTile);
            clearDropHighlights(block);
            return;
        }

        event.preventDefault();

        if (!canMove && canSwap && targetTile) {
            swapTiles(draggedTile, targetTile);
            clearDropHighlights(block);
            return;
        }

        const reference = getColumnInsertReference(targetColumn, draggedTile, event.clientY);
        targetColumn.insertBefore(draggedTile, reference);

        clearDropHighlights(block);
    });

    block.addEventListener("dragleave", (event) => {
        const relatedTarget = event.relatedTarget as Node | null;
        if (relatedTarget && block.contains(relatedTarget)) return;

        clearDropHighlights(block);
    });

    block.addEventListener("dragend", () => {
        if (draggedTile) {
            delete draggedTile.dataset.mosaicDragging;
        }

        clearDropHighlights(block);
        draggedTile = null;
        sourceColumn = null;
    });
}

function ensureTileIsDraggable(tile: HTMLElement): void {
    tile.draggable = true;
    tile.setAttribute("draggable", "true");
}

function clearTileDataset(tile: HTMLElement): void {
    for (const key of Object.keys(tile.dataset)) {
        if (TILE_RESERVED_DATASET_KEYS.has(key)) continue;
        delete (tile.dataset as Record<string, string | undefined>)[key];
    }
}

function getTileCustomDataset(tile: HTMLElement): Record<string, string> | undefined {
    const dataset: Record<string, string> = {};

    for (const [key, value] of Object.entries(tile.dataset)) {
        if (TILE_RESERVED_DATASET_KEYS.has(key)) continue;
        if (value) dataset[key] = value;
    }

    return Object.keys(dataset).length ? dataset : undefined;
}

function getNextTileForImageInsertion(block: HTMLElement, currentTile: HTMLElement): HTMLElement | null {
    const tiles = Array.from(block.querySelectorAll<HTMLElement>(".masonry-gallery__tile[data-mosaic-tile]"));
    if (!tiles.length) return null;

    const currentIndex = tiles.indexOf(currentTile);
    if (currentIndex === -1) return tiles[0];

    const startIndex = (currentIndex + 1) % tiles.length;

    for (let offset = 0; offset < tiles.length; offset += 1) {
        const tile = tiles[(startIndex + offset) % tiles.length];
        if (!tile.dataset.imageSource) return tile;
    }

    return createMosaicTile(block);
}

async function insertDroppedImages(block: HTMLElement, initialTarget: HTMLElement | null, files: FileList): Promise<void> {
    const imageFiles = getImageFilesFromFileList(files);
    if (!imageFiles.length) return;

    let currentTarget = initialTarget;
    if (!currentTarget) {
        const tiles = Array.from(block.querySelectorAll<HTMLElement>(".masonry-gallery__tile[data-mosaic-tile]"));
        currentTarget = tiles.find((tile) => !tile.dataset.imageSource) ?? tiles[0] ?? null;
    }

    if (!currentTarget) return;

    try {
        const uploads = await Promise.all(
            imageFiles.map(async (file) => ({
                url: await saveLocalImage(file),
                alt: file.name,
            })),
        );

        for (const [index, upload] of uploads.entries()) {
            if (!currentTarget) break;

            applyMosaicTileImage({
                target: currentTarget,
                sourceUrl: upload.url,
                alt: upload.alt,
                dataset: getTileCustomDataset(currentTarget),
            });

            const isLastImage = index === uploads.length - 1;
            if (isLastImage) continue;

            currentTarget = getNextTileForImageInsertion(block, currentTarget);
        }
    } catch {
        // Ignore failed drops when local image storage is unavailable.
    }
}

function renderTileImage(tile: HTMLElement, src: string, alt?: string): void {
    ensureTileIsDraggable(tile);
    tile.dataset.imageSource = src;
    if (alt) {
        tile.dataset.imageAlt = alt;
    } else {
        delete tile.dataset.imageAlt;
    }

    tile.dataset.mosaicImage = "true";

    const iconContainer = tile.querySelector<HTMLElement>(".masonry-gallery__tile-content");
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

    void applyImageSourceToElement(img, src);
    img.alt = alt ?? "";
    img.draggable = false;
}

function getTileRatio(tile: HTMLElement): number {
    const value = Number.parseFloat(tile.dataset.mosaicTileRatio ?? "");
    if (!Number.isFinite(value) || value <= 0) return DEFAULT_TILE_RATIO;
    return value;
}

function getColumnHeightScore(column: HTMLElement): number {
    const tiles = column.querySelectorAll<HTMLElement>(".masonry-gallery__tile");
    let totalHeight = 0;

    for (const tile of Array.from(tiles)) {
        totalHeight += 1 / getTileRatio(tile);
    }

    return totalHeight;
}

function getGridElement(block: HTMLElement): HTMLElement {
    let grid = block.querySelector<HTMLElement>(":scope > .masonry-gallery__grid");
    if (grid) return grid;

    grid = <div className="masonry-gallery__grid" data-mosaic-grid="true"></div> as HTMLElement;
    const columns = Array.from(block.querySelectorAll<HTMLElement>(":scope > .masonry-gallery__column"));

    for (const column of columns) {
        grid.appendChild(column);
    }

    block.prepend(grid);
    return grid;
}

function getOrCreateColumns(block: HTMLElement): HTMLElement[] {
    const grid = getGridElement(block);
    const existingColumns = Array.from(grid.querySelectorAll<HTMLElement>(":scope > .masonry-gallery__column"));
    if (existingColumns.length === MOSAIC_COLUMN_COUNT) {
        return existingColumns;
    }

    const columns = Array.from({ length: MOSAIC_COLUMN_COUNT }, () => (
        <div className="masonry-gallery__column" data-mosaic-column="true"></div>
    ) as HTMLElement);

    const tiles = Array.from(grid.querySelectorAll<HTMLElement>(".masonry-gallery__tile"));
    grid.innerHTML = "";

    for (const column of columns) {
        grid.appendChild(column);
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

export function createMosaicTile(block: HTMLElement): HTMLElement {
    const tile = <MasonryTile />;
    getColumnWithMostSpace(block).appendChild(tile);
    return tile;
}

export function MasonryGalleryBlock(): HTMLElement {

    injectStyleOnce("guten:masonry-block", MOSAIC_BLOCK_STYLES);

    return (
        <figure
            className="block masonry-gallery"
            contenteditable="false"
            data-block-id={generateBlockId()}
            ref={(element: HTMLElement | null) => {
                if (!element) return;
                setupMosaicTileDragAndDrop(element);
            }}
        >
            <MasonryGrid />
        </figure>
    );
}