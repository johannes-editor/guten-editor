/** @jsx h */

import { h } from "@core/jsx";
import * as dom from "@utils/dom";
import type { InsertResultContext } from "@core/command";
import type { Command } from "@core/command";
import { CalloutBlock } from "../components/callout-block.tsx";

export const InsertCalloutCommand: Command<InsertResultContext> = {
    id: "insertCallout",
    execute(ctx): boolean {

        const payload = ctx?.content;
        const afterBlock = dom.resolveAfterBlock(payload);

        const callout = <CalloutBlock />;
        const paragraph = callout.querySelector<HTMLElement>("p");
        const text = dom.getInstructionText(payload);
        dom.applyInstructionText(paragraph, text);

        const inserted = dom.appendAfter(afterBlock, callout);
        if (!inserted) return false;

        dom.updateLastInserted(inserted, payload);
        dom.focusIfNeeded(paragraph ?? inserted, payload);

        return true;
    },
};