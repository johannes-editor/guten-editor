import { Command } from "@core/command";
import { applyMosaicTileImage } from "../components/masonry-gallery.tsx";

export type InsertMasonryImageContext = {
    target?: HTMLElement | null;
    sourceUrl: string;
    alt?: string;
    dataset?: Record<string, string>;
};

export const InsertMasonryImage: Command<InsertMasonryImageContext> = {
    id: "insertMasonryImage",
    execute(context): boolean {
        const payload = context?.content;
        if (!payload?.target || !payload.sourceUrl) return false;

        return applyMosaicTileImage({
            target: payload.target,
            sourceUrl: payload.sourceUrl,
            alt: payload.alt,
            dataset: payload.dataset,
        });
    },
};