import { ClassName } from "../../utils/dom/class-name.ts";
import { focusOnElement } from "../../utils/dom-utils.ts";

export class BlockquoteEnterHandler {
    private isFirefox: boolean;

    constructor(private target: HTMLElement) {
        this.isFirefox = typeof navigator !== "undefined" && /firefox/i.test(navigator.userAgent);
    }

    public start() {
        if (!this.isFirefox) return;
        this.target.addEventListener("keydown", this.handleKeyDown, true);
    }

    public stop() {
        if (!this.isFirefox) return;
        this.target.removeEventListener("keydown", this.handleKeyDown, true);
    }

    private handleKeyDown = (e: KeyboardEvent) => {
        if (e.key !== "Enter") return;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const blockquote = this.getClosestBlockquote(range.startContainer);
        if (!blockquote) return;

        e.preventDefault();
        e.stopImmediatePropagation();

        const contentAfter = range.cloneRange();
        contentAfter.setStart(range.endContainer, range.endOffset);
        const fragment = contentAfter.extractContents();

        const newParagraph = document.createElement("p");
        newParagraph.classList.add("block");
        newParagraph.classList.add("placeholder");
        newParagraph.dataset.placeholder = "Start typing...";
        newParagraph.innerHTML = fragment.textContent?.trim() ? "" : "<br>";
        newParagraph.appendChild(fragment);

        blockquote.insertAdjacentElement("afterend", newParagraph);

        focusOnElement(newParagraph);
    };

    private getClosestBlockquote(node: Node): HTMLElement | null {
        let current: Node | null = node;
        while (current && current !== this.target) {
            if (current instanceof HTMLElement && current.tagName === "BLOCKQUOTE") {
                return current;
            }
            current = current.parentNode;
        }
        return null;
    }
}