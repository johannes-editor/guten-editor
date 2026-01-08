import { Command, CommandContext } from "../../../core/command/command.ts";
import { selection } from "../../index.ts";
import { BlockOptionsPlugin } from "../extensible/block-options-plugin.tsx";

export const OpenBlockOptions: Command = {
    id: "openBlockOptions",
    shortcut: { chord: "Mod+/", description: "Open block options" },
    
    execute(context: CommandContext<{ block?: HTMLElement; rect?: DOMRect }>): boolean {
        const block = context.content?.block ?? selection.findClosestBlockBySelection();
        if (!block) return false;

        const rect = context.content?.rect ?? null;

        const anchor = rect ? null : selection.createAnchorAtSelection();
        const menu = BlockOptionsPlugin.openForBlock(block, rect ?? anchor);
        return Boolean(menu);
    }
};