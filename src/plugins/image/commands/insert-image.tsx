import { Command } from "@core/command";
import { ensureBlockId } from "@utils/dom/block.ts";
import { createImageBlock, extractImageBlockDataset, isImageBlockElement } from "../components/image-block.tsx";
import { ImagePlaceholder } from "../components/image-placeholder.tsx";
import { IMAGE_ADDED_EVENT, getImageSourceType, type ImageAddedEventDetail } from "../image-events.ts";

export type InsertImagePayload = {
    target?: HTMLElement | null;
    sourceUrl: string;
    alt?: string;
    dataset?: Record<string, string>;
};

export const InsertImage: Command<InsertImagePayload> = {
    id: "insertImage",
    execute(context): boolean {
        const payload = context?.content;
        if (!payload?.sourceUrl) return false;

        const target = payload.target ?? null;
        const inheritedBlockId = target?.dataset?.blockId;

        const element = createImageBlock({
            src: payload.sourceUrl,
            alt: payload.alt,
            dataset: payload.dataset,
            blockId: inheritedBlockId,
        });
        const blockId = ensureBlockId(element, inheritedBlockId);

        if (target && target.isConnected) {
            if (target.matches(ImagePlaceholder.getTagName()) || isImageBlockElement(target)) {
                target.replaceWith(element);
            } else {
                target.after(element);
                target.remove();
            }
        } else {
            const selection = globalThis.getSelection();
            if (selection?.rangeCount) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(element);
            }
        }

        if (typeof document !== "undefined") {
            const img = element.querySelector<HTMLImageElement>("img");
            const dataset = extractImageBlockDataset(element);
            const detail: ImageAddedEventDetail = {
                blockId,
                mediaType: "image",
                sourceType: getImageSourceType(payload.sourceUrl),
                src: payload.sourceUrl,
                alt: img?.alt ?? undefined,
                dataset,
                element,
            };

            document.dispatchEvent(new CustomEvent<ImageAddedEventDetail>(IMAGE_ADDED_EVENT, { detail }));
        }

        return true;
    },
};