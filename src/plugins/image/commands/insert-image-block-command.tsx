/** @jsx h */

import { h } from "@core/jsx/index.ts";
import { Command } from "@core/command/index.ts";
import { InsertResultContext } from "@core/command/index.ts";
import { appendAfter, focusIfNeeded, resolveAfterBlock, updateLastInserted } from "@utils/dom/index.ts";
import { createImageBlock } from "../components/image-block.tsx";
import { ImagePlaceholder } from "../components/image-placeholder.tsx";

export const InsertImageBlockCommand: Command<InsertResultContext> = {
    id: "insertImageBlock",
    execute(ctx): boolean {
        const payload = ctx?.content;
        const instruction = payload?.instruction;
        const afterBlock = resolveAfterBlock(payload);

        const src = instruction?.attrs?.src;
        const alt = instruction?.attrs?.alt ?? instruction?.content;
        const dataset = instruction?.attrs;

        const element = src
            ? createImageBlock({ src, alt, dataset })
            : <ImagePlaceholder /> as HTMLElement;

        const inserted = appendAfter(afterBlock, element as HTMLElement);
        if (!inserted) return false;

        updateLastInserted(inserted, payload);
        focusIfNeeded(inserted, payload);
        return true;
    },
};