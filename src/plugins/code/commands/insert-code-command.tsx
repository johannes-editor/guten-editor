/** @jsx h */


import { InsertResultContext } from "../../../core/command/types.ts";
import { appendAfter, applyInstructionText, focusIfNeeded, getInstructionText, resolveAfterBlock, updateLastInserted } from "../../../utils/dom/index.ts";
import { Command, h } from "../../index.ts";
import { CodeBlock } from "../components/code-block.tsx";

export const InsertCodeBlockCommand: Command<InsertResultContext> = {
    id: "insertCodeBlock",
    execute(ctx): boolean {
        const payload = ctx?.content;
        const afterBlock = resolveAfterBlock(payload);
        const codeBlock = <CodeBlock /> as HTMLElement;
        const code = codeBlock.querySelector<HTMLElement>("code");
        const text = getInstructionText(payload);
        applyInstructionText(code, text);

        const inserted = appendAfter(afterBlock, codeBlock);
        if (!inserted) return false;

        updateLastInserted(inserted, payload);
        focusIfNeeded(code ?? inserted, payload);
        return true;
    },
};