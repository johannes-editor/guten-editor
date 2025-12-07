/** @jsx h */
import { Command, CommandContext } from "../../../core/command/command.ts";
import { selection, dom } from "../../index.ts";
import { BlockOptionPayload } from "./types.ts";

export const MoveBlockUp: Command = {
    id: "moveBlockUp",
    shortcut: { chord: "Alt+ArrowUp", description: "Move block up" },
    execute(context: CommandContext<BlockOptionPayload>): boolean {

        context.content?.blockOptions.remove();

        const currentBlock =
            context.content?.block ?? selection.findClosestBlockBySelection(context.selection ?? null);
            
        if (!currentBlock) return false;

        return dom.moveBlockUpPreservingCaret(currentBlock);
    }
};