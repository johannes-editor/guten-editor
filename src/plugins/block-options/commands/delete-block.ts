/** @jsx h */

import { Command, CommandContext } from "@/core/command";
import { getNextBlockSibling, getPrevBlockSibling, focusStartOfBlock, removeBlockWithTransition } from "@utils/dom";
import { findClosestBlockBySelection } from "@utils/selection";
import { BlockOptionPayload } from "./types.ts";


export const DeleteBlock: Command = {
    id: "deleteBlock",
    shortcut: { chord: "Mod+Backspace", description: "Delete block" },

    execute(context: CommandContext<BlockOptionPayload>): boolean {

        context.content?.blockOptions.remove();

        const currentBlock =
            context.content?.block ?? findClosestBlockBySelection(context.selection ?? null);

        if (!currentBlock || !currentBlock.parentElement) return false;


        const dest = getNextBlockSibling(currentBlock) || getPrevBlockSibling(currentBlock);

        if (dest) {
            focusStartOfBlock(dest);
        } else {
            const sel = globalThis.getSelection?.();
            sel?.removeAllRanges();
        }

        return removeBlockWithTransition(currentBlock, 200);
    }
};
