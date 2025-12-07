/** @jsx h */
import { Command, CommandContext } from "../../../core/command/command.ts";
import { selection, dom } from "../../index.ts";
import { BlockOptionPayload } from "./types.ts";

export const MoveBlockDown: Command = {
    id: "moveBlockDown",
    shortcut: { chord: "Alt+ArrowDown", description: "Move block down" },
    execute(context: CommandContext<BlockOptionPayload>): boolean {

        context.content?.blockOptions.remove();

        const currentBlock =
            context.content?.block ?? selection.findClosestBlockBySelection(context.selection ?? null);

        if (!currentBlock) return false;

        return dom.moveBlockDownPreservingCaret(currentBlock);
    }
};
