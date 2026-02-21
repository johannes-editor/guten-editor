import { Command, CommandContext } from "@/core/command";
import { findClosestBlockBySelection, createAnchorAtSelection } from "@utils/selection";
import { BlockOptionsPlugin } from "../extensible/block-options-plugin.tsx";

export const OpenBlockOptions: Command = {
    id: "openBlockOptions",
    shortcut: { chord: "Mod+Slash", description: "Open block options" },
    
    execute(context: CommandContext<{ block?: HTMLElement; rect?: DOMRect; anchor?: HTMLElement | null }>): boolean {
        const block = context.content?.block ?? findClosestBlockBySelection();
        if (!block) return false;

        const rect = context.content?.rect ?? null;
        const contextualAnchor = context.content?.anchor ?? null;
        

        const anchor = contextualAnchor ?? (rect ? null : createAnchorAtSelection());
        const menu = BlockOptionsPlugin.openForBlock(block, anchor ?? rect);
        return Boolean(menu);
    }
};