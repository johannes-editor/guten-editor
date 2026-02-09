import { Command, CommandContext } from "@/core/command";
import { findClosestBlockBySelection } from "@utils/selection";
import { moveBlockUpPreservingCaret } from "@utils/dom";
import { BlockOptionPayload } from "./types.ts";

export const MoveBlockUp: Command = {
    id: "moveBlockUp",
    shortcut: { chord: "Alt+ArrowUp", description: "Move block up" },
    execute(context: CommandContext<BlockOptionPayload>): boolean {

        context.content?.blockOptions.remove();

        const currentBlock =
            context.content?.block ?? findClosestBlockBySelection(context.selection ?? null);
            
        if (!currentBlock) return false;

        return moveBlockUpPreservingCaret(currentBlock);
    }
};