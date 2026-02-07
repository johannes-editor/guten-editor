
import { Command, CommandContext } from "@/core/command/index.ts";
import { findClosestBlockBySelection } from "@utils/selection/index.ts";

function rangesEqual(a: Range | null, b: Range | null): boolean {
    if (!a || !b) return false;
    return (
        a.startContainer === b.startContainer &&
        a.startOffset === b.startOffset &&
        a.endContainer === b.endContainer &&
        a.endOffset === b.endOffset
    );
}

export const SelectBlockContent: Command = {
    id: "selectBlockContent",
    shortcut: {
        chord: "Mod+A",
        preventDefault: false,
        description: "Select the contents of the current block",
    },

    execute(context?: CommandContext): boolean {
        const sel = globalThis.getSelection?.();
        if (!sel || sel.rangeCount === 0) return false;

        const block = findClosestBlockBySelection();
        if (!block) return false;

        const range = sel.getRangeAt(0);
        if (!block.contains(range.startContainer) || !block.contains(range.endContainer)) {
            return false;
        }

        const blockRange = document.createRange();
        blockRange.selectNodeContents(block);

        if (rangesEqual(range, blockRange)) {
            return false;
        }

        const event = context?.event;
        if (event instanceof KeyboardEvent) {
            event.preventDefault();
            event.stopPropagation();
        }

        sel.removeAllRanges();
        sel.addRange(blockRange);
        return true;
    },
};