/** @jsx h */

import { InsertResultContext } from "../../../core/command/types.ts";
import { appendAfter, applyInstructionText, focusIfNeeded, getInstructionText, resolveAfterBlock, updateLastInserted } from "../../../utils/dom/index.ts";
import { h, Command } from "../../index.ts";
import { CalloutBlock } from "../components/callout-block.tsx";

export const InsertCalloutCommand: Command<InsertResultContext> = {
    id: "insertCallout",
    execute(ctx): boolean {
        const payload = ctx?.content;
        const afterBlock = resolveAfterBlock(payload);
        const callout = <CalloutBlock /> as HTMLElement;
        const paragraph = callout.querySelector<HTMLElement>("p");
        const text = getInstructionText(payload);
        applyInstructionText(paragraph, text);

        const inserted = appendAfter(afterBlock, callout);
        if (!inserted) return false;

        updateLastInserted(inserted, payload);
        focusIfNeeded(paragraph ?? inserted, payload);
        return true;
    },
};