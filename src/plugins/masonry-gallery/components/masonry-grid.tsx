import { injectStyleOnce } from "@utils/dom";
import { MasonryTile } from "./masonry-tile.tsx";

const MASONRY_GRID_STYLES = /*css*/`
    .masonry-gallery__grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: var(--space-sm);
    }

    .masonry-gallery__column {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        min-width: 0;
    }
`;

export function MasonryGrid(): HTMLDivElement {

    injectStyleOnce("guten:masonry-grid", MASONRY_GRID_STYLES);

    return (
        <div className="masonry-gallery__grid" data-mosaic-grid="true">
            <div className="masonry-gallery__column" data-mosaic-column="true"><MasonryTile /></div>
            <div className="masonry-gallery__column" data-mosaic-column="true"><MasonryTile /></div>
            <div className="masonry-gallery__column" data-mosaic-column="true"><MasonryTile /></div>
        </div>
    );
}