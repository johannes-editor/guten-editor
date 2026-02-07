import { Plugin } from "@core/plugin-engine";
import { ParagraphBlock } from "@components/blocks";
import { focusOnElement, } from "@utils/dom";
import { KeyboardKeys } from "@utils/keyboard";
import { EventTypes, ClassName } from "@utils/dom";

export class CalloutEnterPlugin extends Plugin {

    private editorContent: HTMLElement | null = null;

    override setup(root: HTMLElement): void {
        if (this.editorContent) {
            this.editorContent.removeEventListener(EventTypes.KeyDown, this.handleKeyDown, true);
        }

        const editorContent = root.querySelector<HTMLElement>("#editorContent");
        if (!editorContent) {
            console.warn("[CalloutEnterPlugin] Unable to find #editorContent in editor root.");
            this.editorContent = null;
            return;
        }

        this.editorContent = editorContent;
        editorContent.addEventListener(EventTypes.KeyDown, this.handleKeyDown, true);
    }

    teardown(): void {
        if (this.editorContent) {
            this.editorContent.removeEventListener(EventTypes.KeyDown, this.handleKeyDown, true);
            this.editorContent = null;
        }
    }

    private readonly handleKeyDown = (event: KeyboardEvent) => {

        if (event.key !== KeyboardKeys.Enter) return;
        if (event.shiftKey || event.altKey || event.metaKey || event.ctrlKey) return;
        if (event.defaultPrevented) return;
        if (event.isComposing) return;

        const contentArea = this.editorContent;
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
        if (!this.isLastParagraphInCallout(paragraph, callout)) return;

        event.preventDefault();
        event.stopPropagation();

        if (this.isFirstParagraphInCallout(paragraph, callout)) {
            const newParagraph = this.createParagraph(doc);
            callout.insertAdjacentElement("afterend", newParagraph);
            focusOnElement(newParagraph);
            this.dispatchInput(newParagraph);
            return;
        }

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
        const editorContent = this.editorContent;
        while (node && editorContent && node !== editorContent) {
            if (node instanceof HTMLParagraphElement) {
                return node;
            }
            node = node.parentNode;
        }
        return null;
    }

    private findClosestCallout(node: Node | null): HTMLElement | null {
        const editorContent = this.editorContent;
        while (node && editorContent && node !== editorContent) {
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

    private isLastParagraphInCallout(paragraph: HTMLParagraphElement, callout: HTMLElement): boolean {
        return callout.lastElementChild === paragraph;
    }

    private isFirstParagraphInCallout(paragraph: HTMLParagraphElement, callout: HTMLElement): boolean {
        return callout.firstElementChild === paragraph;
    }
}