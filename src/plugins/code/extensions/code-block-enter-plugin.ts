import { Plugin } from "@core/plugin-engine/plugin.ts";

export class CodeBlockEnterPlugin extends Plugin {

    private contentArea: HTMLElement | null = null;

    private handleKeyDown = (event: KeyboardEvent) => {

        if (event.key !== "Enter") return;

        if (event.defaultPrevented) return;
        if (event.isComposing) return;
        if (!this.contentArea) return;

        const selection = this.contentArea.ownerDocument?.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const startCode = this.findClosestCodeElement(range.startContainer);
        if (!startCode) return;

        const endCode = this.findClosestCodeElement(range.endContainer);
        if (endCode !== startCode) return;

        event.preventDefault();
        event.stopPropagation();

        if (!selection.isCollapsed) range.deleteContents();

        const doc = this.contentArea.ownerDocument ?? document;
        const nl = doc.createTextNode("\n\u200B");
        range.insertNode(nl);

        const caret = doc.createRange();
        caret.setStart(nl, 2);
        caret.collapse(true);
        selection.removeAllRanges();
        selection.addRange(caret);

        this.cleanupPlaceholder(startCode);
        this.dispatchInput(startCode);
    };

    override setup(root: HTMLElement): void {
        const contentArea = root.querySelector<HTMLElement>("#contentArea");
        if (!contentArea) {
            console.warn("[CodeBlockEnterPlugin] Unable to find #contentArea in editor root.");
            return;
        }

        this.contentArea = contentArea;
        contentArea.addEventListener("keydown", this.handleKeyDown, true);
    }

    private findClosestCodeElement(node: Node | null): HTMLElement | null {
        while (node && node !== this.contentArea) {
            if (node instanceof HTMLElement && node.matches(".code-block code")) {
                return node;
            }
            node = node.parentNode;
        }
        return null;
    }

    private cleanupPlaceholder(codeElement: HTMLElement) {
        if (codeElement.classList.contains("guten-placeholder") || codeElement.classList.contains("empty")) {
            const children = Array.from(codeElement.childNodes);
            for (const child of children) {
                if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName === "BR") {
                    codeElement.removeChild(child);
                }
            }
            codeElement.classList.remove("guten-placeholder");
            codeElement.classList.remove("empty");
        }
    }

    private dispatchInput(codeElement: HTMLElement) {
        const event = new Event("input", { bubbles: true });
        codeElement.dispatchEvent(event);
    }
}