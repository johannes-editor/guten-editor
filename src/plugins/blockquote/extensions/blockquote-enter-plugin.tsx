/** @jsx h */

import { h } from "@core/jsx";
import { Plugin } from "@core/plugin-engine";
import { ParagraphBlock } from "@components/blocks";
import { focusOnElement } from "@utils/dom";

export class BlockquoteEnterPlugin extends Plugin {

    private editorContent: HTMLElement | null = null;

    override setup(root: HTMLElement): void {
        if (this.editorContent) {
            this.editorContent.removeEventListener("keydown", this.handleKeyDown, true);
        }

        const editorContent = root.querySelector<HTMLElement>("#editorContent");
        if (!editorContent) {
            console.warn("[BlockquoteEnterPlugin] Unable to find #editorContent in editor root.");
            return;
        }

        this.editorContent = editorContent;
        editorContent.addEventListener("keydown", this.handleKeyDown, true);
    }

    private handleKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Enter") return;
        if (event.shiftKey) return;
        if (event.defaultPrevented) return;
        if (event.isComposing) return;

        const contentArea = this.editorContent;
        if (!contentArea) return;

        const doc = contentArea.ownerDocument ?? document;

        if (this.hasActiveSlashMenu(doc)) return;
        const selection = doc.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const startBlockquote = this.findClosestBlockquote(range.startContainer);
        if (!startBlockquote) return;

        const endBlockquote = this.findClosestBlockquote(range.endContainer);
        if (endBlockquote !== startBlockquote) return;

        event.preventDefault();
        event.stopPropagation();

        if (!selection.isCollapsed) {
            range.deleteContents();
        }

        range.collapse(false);

        const trailingRange = range.cloneRange();
        trailingRange.selectNodeContents(startBlockquote);
        trailingRange.setStart(range.endContainer, range.endOffset);
        const trailingFragment = trailingRange.extractContents();

        const paragraph = this.createParagraph(doc);
        if (trailingFragment.childNodes.length) {
            paragraph.innerHTML = "";
            paragraph.append(trailingFragment);
        }

        if (paragraph.textContent?.trim().length) {
            paragraph.classList.remove("empty");
        } else {
            paragraph.innerHTML = "<br />";
        }

        startBlockquote.insertAdjacentElement("afterend", paragraph);

        this.normalizeBlockquote(startBlockquote);

        focusOnElement(paragraph);

        this.dispatchInput(startBlockquote);
        this.dispatchInput(paragraph);
    };

    private findClosestBlockquote(node: Node | null): HTMLElement | null {
        const editorContent = this.editorContent;
        while (node && editorContent && node !== editorContent) {
            if (node instanceof HTMLElement && node.tagName === "BLOCKQUOTE") {
                return node;
            }
            node = node.parentNode;
        }
        return null;
    }

    private hasActiveSlashMenu(doc: Document): boolean {
        return doc.getElementsByTagName("guten-slash-menu").length > 0;
    }

    private createParagraph(doc: Document): HTMLParagraphElement {
        const paragraph = <ParagraphBlock /> as HTMLParagraphElement;
        if (paragraph.ownerDocument !== doc && "adoptNode" in doc) {
            return doc.adoptNode(paragraph) as HTMLParagraphElement;
        }
        return paragraph;
    }

    private normalizeBlockquote(blockquote: HTMLElement) {
        const text = blockquote.textContent?.trim() ?? "";
        if (!text.length) {
            if (!blockquote.querySelector("br")) {
                blockquote.innerHTML = "<br />";
            }
            blockquote.classList.add("empty");
        } else {
            blockquote.classList.remove("empty");
        }
    }

    private dispatchInput(target: HTMLElement) {
        const event = new Event("input", { bubbles: true });
        target.dispatchEvent(event);
    }
}