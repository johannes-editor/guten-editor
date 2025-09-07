/** @jsx h */
import { Command, CommandContext } from "../../../core/command/command.ts";
import { selection, dom } from "../../index.ts";
import { BlockOptionPayload } from "./types.ts";

export const DuplicateBlock: Command = {
    id: "duplicateBlock",

    shortcut: { chord: "Mod+D", description: "Duplicate a block" },

    execute(context: CommandContext<BlockOptionPayload>): boolean {

        context.content?.blockOptions.remove();

        const currentBlock = context.content?.block ?? selection.findClosestBlockBySelection();

        if (!currentBlock) return false;


        dom.duplicateBlock(currentBlock, {
            insert: 'after',
            highlight: true,
            highlightMs: 900,
            sanitizeIds: true,
        });

        return true;
    }
};