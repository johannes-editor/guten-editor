import { Command } from "@core/command";
import { extractImageBlockDataset, findImageBlockById, updateImageBlockElement } from "../components/image-block.tsx";
import type { ImageReplaceEventDetail } from "../image-events.ts";

export type ReplaceImagePayload = ImageReplaceEventDetail;

export const ReplaceImage: Command<ReplaceImagePayload> = {
    id: "replaceImage",
    execute(context): boolean {
        const detail = context?.content;
        if (!detail?.blockId || !detail.url) return false;
        if (typeof document === "undefined") return false;

        const element = findImageBlockById(detail.blockId);
        if (!element) return false;

        const img = element.querySelector<HTMLImageElement>("img");
        const dataset = detail.dataset ?? extractImageBlockDataset(element);
        const alt = detail.alt ?? img?.alt ?? undefined;

        updateImageBlockElement(element, {
            src: detail.url,
            alt,
            dataset,
            blockId: detail.blockId,
        });

        return true;
    },
};