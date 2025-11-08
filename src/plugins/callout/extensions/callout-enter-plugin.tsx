/** @jsx h */

import { h } from "../../../jsx.ts";
import { Plugin } from "../../../core/plugin-engine/plugin.ts";
import { ParagraphBlock } from "../../../components/blocks/paragraph.tsx";
import { focusOnElement } from "../../../utils/dom-utils.ts";
import { ClassName } from "../../../utils/dom/class-name.ts";

export class CalloutEnterPlugin extends Plugin {

    private contentArea: HTMLElement | null = null;

    override setup(root: HTMLElement): void {
        if (this.contentArea) {
            this.contentArea.removeEventListener("keydown", this.handleKeyDown, true);
        }

        const contentArea = root.querySelector<HTMLElement>("#contentArea");
        if (!contentArea) {
            console.warn("[CalloutEnterPlugin] Unable to find #contentArea in editor root.");
            this.contentArea = null;
            return;
        }

        this.contentArea = contentArea;
        contentArea.addEventListener("keydown", this.handleKeyDown, true);
    }

    teardown(): void {
        if (this.contentArea) {
            this.contentArea.removeEventListener("keydown", this.handleKeyDown, true);
            this.contentArea = null;
        }
    }

    private readonly handleKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Enter") return;
        if (event.shiftKey || event.altKey || event.metaKey || event.ctrlKey) return;
        if (event.defaultPrevented) return;
        if (event.isComposing) return;

        const contentArea = this.contentArea;
        if (!contentArea) return;

        const doc = contentArea.ownerDocument ?? document;
        const selection = doc.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        if (!selection.isCollapsed) return;

        const range = selection.getRangeAt(0);
        const paragraph = this.findClosestParagraph(range.startContainer);
        if (!paragraph) return;

        const callout = this.findClosestCallout(paragraph);
        if (!callout) return;

        if (!this.isEmptyCalloutParagraph(paragraph)) return;

        event.preventDefault();
        event.stopPropagation();

        const newParagraph = this.createParagraph(doc);
        paragraph.remove();

        callout.insertAdjacentElement("afterend", newParagraph);

        const calloutParent = callout.parentElement;
        if (!callout.querySelector("p")) {
            callout.remove();
            if (calloutParent) {
                this.dispatchInput(calloutParent);
            }
        } else {
            this.dispatchInput(callout);
        }

        focusOnElement(newParagraph);
        this.dispatchInput(newParagraph);
    };

    private findClosestParagraph(node: Node | null): HTMLParagraphElement | null {
        const contentArea = this.contentArea;
        while (node && contentArea && node !== contentArea) {
            if (node instanceof HTMLParagraphElement) {
                return node;
            }
            node = node.parentNode;
        }
        return null;
    }

    private findClosestCallout(node: Node | null): HTMLElement | null {
        const contentArea = this.contentArea;
        while (node && contentArea && node !== contentArea) {
            if (node instanceof HTMLElement && node.classList.contains("callout")) {
                return node;
            }
            node = node.parentNode;
        }
        return null;
    }

    private isEmptyCalloutParagraph(paragraph: HTMLParagraphElement): boolean {
        const text = paragraph.textContent?.replace(/\u00A0/g, "").trim() ?? "";
        return text === "" && paragraph.classList.contains(ClassName.Placeholder);
    }

    private createParagraph(doc: Document): HTMLParagraphElement {
        const paragraph = <ParagraphBlock /> as HTMLParagraphElement;
        if (paragraph.ownerDocument !== doc && "adoptNode" in doc) {
            return doc.adoptNode(paragraph) as HTMLParagraphElement;
        }
        return paragraph;
    }

    private dispatchInput(target: HTMLElement) {
        const event = new Event("input", { bubbles: true });
        target.dispatchEvent(event);
    }
}