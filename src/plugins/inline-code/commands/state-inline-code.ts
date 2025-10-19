import { Command } from "../../../core/command/command.ts";
import { dom } from "../../index.ts";

export const StateInlineCode: Command = {
    id: "stateInlineCode",
    execute() {
        
        const selection = globalThis.getSelection?.();

        if (!selection || selection.rangeCount === 0) {
            return false;
        }

        const range = selection.getRangeAt(0);
        const startCode = dom.findCodeAncestor(range.startContainer);
        const endCode = dom.findCodeAncestor(range.endContainer);

        return !!(startCode && endCode && startCode === endCode);
    },
};