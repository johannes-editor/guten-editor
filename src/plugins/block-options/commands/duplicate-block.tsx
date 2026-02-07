/** @jsx h */
import { Command, CommandContext } from "@/core/command/command.ts";
import { duplicateBlock } from "@utils/dom/index.ts";
import { findClosestBlockBySelection } from "@utils/selection/index.ts";
import { BlockOptionPayload } from "./types.ts";

export const DuplicateBlock: Command = {
    id: "duplicateBlock",

    shortcut: { chord: "Mod+D", description: "Duplicate a block" },

    execute(context: CommandContext<BlockOptionPayload>): boolean {

        context.content?.blockOptions.remove();

        const currentBlock = context.content?.block ?? findClosestBlockBySelection();

        if (!currentBlock) return false;

        duplicateBlock(currentBlock, {
            insert: 'after',
            highlight: true,
            highlightMs: 900,
            sanitizeIds: true,
        });

        return true;
    }
};