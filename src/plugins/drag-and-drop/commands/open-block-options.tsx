import { Command, CommandContext } from "../../../core/command/command.ts";
import { selection } from "../../index.ts";
import { BlockOptionsPlugin } from "../../block-options/block-options-plugin.tsx";

export const OpenBlockOptions: Command = {
    id: "openBlockOptions",
    shortcut: { chord: "Mod+Shift+O", description: "Open block options" },
    execute(context: CommandContext<{ block?: HTMLElement; rect?: DOMRect }>): boolean {
        const block = context.content?.block ?? selection.findClosestBlockBySelection();
        if (!block) return false;

        const menu = BlockOptionsPlugin.openForBlock(block, context.content?.rect ?? null);
        return Boolean(menu);
    }
};