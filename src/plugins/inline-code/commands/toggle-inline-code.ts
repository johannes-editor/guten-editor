import { Command } from "@core/command";
import { findCodeAncestor } from "@utils/dom";
import { hasSelection } from "@utils/selection";

export const ToggleInlineCode: Command = {
    id: "toggleInlineCode",
    shortcut: { chord: "Mod+E", description: "Toggle inline code", when: () => hasSelection(), preventDefault: true },
    execute() {
        const selection = globalThis.getSelection?.();

        if (!selection || selection.rangeCount === 0) {
            return false;
        }

        const range = selection.getRangeAt(0);

        if (!range) return false;

        const documentRef = range.commonAncestorContainer.ownerDocument ?? document;

        const startCode = findCodeAncestor(range.startContainer);
        const endCode = findCodeAncestor(range.endContainer);

        if (startCode && startCode === endCode) {
            const codeElement = startCode;
            const parent = codeElement.parentNode;

            if (!parent) return false;

            const textNode = documentRef.createTextNode(codeElement.textContent ?? "");
            parent.replaceChild(textNode, codeElement);

            const newRange = documentRef.createRange();
            newRange.selectNodeContents(textNode);

            selection.removeAllRanges();
            selection.addRange(newRange);

            return true;
        }

        if (range.collapsed) {
            return false;
        }

        const selectedText = range.toString();

        if (!selectedText) {
            return false;
        }

        const codeElement = documentRef.createElement("code");
        codeElement.textContent = selectedText;

        range.deleteContents();
        range.insertNode(codeElement);

        const newRange = documentRef.createRange();
        newRange.selectNodeContents(codeElement);

        selection.removeAllRanges();
        selection.addRange(newRange);

        return true;
    },
};