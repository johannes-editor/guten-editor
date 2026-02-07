/** @jsx h */
import { Command, CommandContext } from "@/core/command/command.ts";
import {  moveBlockDownPreservingCaret } from "@utils/dom/index.ts";
import { findClosestBlockBySelection } from "@utils/selection/index.ts";
import { BlockOptionPayload } from "./types.ts";

export const MoveBlockDown: Command = {
    id: "moveBlockDown",
    shortcut: { chord: "Alt+ArrowDown", description: "Move block down" },
    execute(context: CommandContext<BlockOptionPayload>): boolean {

        context.content?.blockOptions.remove();

        const currentBlock =
            context.content?.block ?? findClosestBlockBySelection(context.selection ?? null);

        if (!currentBlock) return false;

        return moveBlockDownPreservingCaret(currentBlock);
    }
};
