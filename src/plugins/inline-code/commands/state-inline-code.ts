import { Command } from "@core/command";
import { findCodeAncestor } from "@utils/dom";

export const StateInlineCode: Command = {
    id: "stateInlineCode",
    execute() {

        const selection = globalThis.getSelection?.();

        if (!selection || selection.rangeCount === 0) {
            return false;
        }

        const range = selection.getRangeAt(0);
        const startCode = findCodeAncestor(range.startContainer);
        const endCode = findCodeAncestor(range.endContainer);

        return !!(startCode && endCode && startCode === endCode);
    },
};