/** @jsx h */
import { Command, CommandContext } from "../../../core/command/command.ts";
import { selection, dom } from "../../index.ts";
import { BlockOptionPayload } from "./types.ts";


export const DeleteBlock: Command = {
    id: "deleteBlock",
    shortcut: { chord: "Mod+Backspace", description: "Delete block" },

    execute(context: CommandContext<BlockOptionPayload>): boolean {

        context.content?.blockOptions.remove();

        const currentBlock =
            context.content?.block ?? selection.findClosestBlockBySelection();

        if (!currentBlock || !currentBlock.parentElement) return false;


        const dest = dom.getNextBlockSibling(currentBlock) || dom.getPrevBlockSibling(currentBlock);

        if (dest) {
            dom.focusStartOfBlock(dest);
        } else {
            const sel = globalThis.getSelection?.();
            sel?.removeAllRanges();
        }

        return dom.removeBlockWithTransition(currentBlock, 200);
    },
};
