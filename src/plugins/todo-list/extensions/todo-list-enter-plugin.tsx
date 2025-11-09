/** @jsx h */

import { h } from "../../../jsx.ts";
import { Plugin } from "../../../core/plugin-engine/plugin.ts";
import { ParagraphBlock } from "../../../components/blocks/paragraph.tsx";
import { focusOnElement } from "../../../utils/dom-utils.ts";
import { ClassName } from "../../../utils/dom/class-name.ts";
import { createTodoItem, createTodoList } from "../utils.tsx";

export class TodoListEnterPlugin extends Plugin {

    private contentArea: HTMLElement | null = null;

    override setup(root: HTMLElement): void {
        if (this.contentArea) {
            this.contentArea.removeEventListener("keydown", this.handleKeyDown, true);
        }

        const contentArea = root.querySelector<HTMLElement>("#contentArea");
        if (!contentArea) {
            console.warn("[TodoListEnterPlugin] Unable to find #contentArea in editor root.");
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

        const range = selection.getRangeAt(0);
        const span = this.findEditableSpan(range.startContainer);
        if (!span) return;

        const listItem = span.closest<HTMLLIElement>("li");
        if (!listItem) return;

        const list = listItem.closest<HTMLUListElement>("ul.todo-list");
        if (!list) return;

        event.preventDefault();
        event.stopPropagation();

        if (!selection.isCollapsed) {
            range.deleteContents();
        }

        range.collapse(false);

        if (this.isTodoItemEmpty(span)) {
            this.handleEmptyItem(doc, list, listItem);
            return;
        }

        this.insertTodoItemAfter(doc, span, listItem, list, range);
    };

    private insertTodoItemAfter(
        doc: Document,
        span: HTMLSpanElement,
        currentItem: HTMLLIElement,
        list: HTMLUListElement,
        caretRange: Range,
    ) {
        const trailingRange = caretRange.cloneRange();
        trailingRange.setEnd(span, span.childNodes.length);
        const trailingFragment = trailingRange.extractContents();

        const remainingText = span.textContent?.replace(/\u00A0/g, "").trim() ?? "";
        if (remainingText.length === 0) {
            span.innerHTML = "<br />";
            span.classList.add(ClassName.Empty);
        } else {
            span.classList.remove(ClassName.Empty);
        }

        const newItem = createTodoItem(doc);
        const newSpan = newItem.querySelector<HTMLSpanElement>("span[contenteditable]");

        if (newSpan) {
            newSpan.innerHTML = "";
            if (trailingFragment.childNodes.length) {
                newSpan.append(trailingFragment);
            }

            const text = newSpan.textContent?.replace(/\u00A0/g, "").trim() ?? "";
            if (text.length === 0) {
                newSpan.innerHTML = "<br />";
                newSpan.classList.add(ClassName.Empty);
            } else {
                newSpan.classList.remove(ClassName.Empty);
            }
        }

        currentItem.insertAdjacentElement("afterend", newItem);

        const focusTarget = newItem.querySelector<HTMLElement>("span[contenteditable]");
        focusOnElement(focusTarget);

        this.dispatchInput(list);
    }

    private handleEmptyItem(doc: Document, list: HTMLUListElement, item: HTMLLIElement) {
        const followingItems: HTMLLIElement[] = [];
        let sibling = item.nextElementSibling as HTMLLIElement | null;
        while (sibling) {
            const next = sibling.nextElementSibling as HTMLLIElement | null;
            followingItems.push(sibling);
            sibling = next;
        }

        item.remove();

        const paragraph = this.createParagraph(doc);
        list.insertAdjacentElement("afterend", paragraph);

        if (followingItems.length > 0) {
            const newList = createTodoList(doc, followingItems);
            paragraph.insertAdjacentElement("afterend", newList);
            this.dispatchInput(newList);
        }

        if (!list.querySelector("li")) {
            const parent = list.parentElement;
            list.remove();
            if (parent) {
                this.dispatchInput(parent);
            }
        } else {
            this.dispatchInput(list);
        }

        focusOnElement(paragraph);
        this.dispatchInput(paragraph);
    }

    private findEditableSpan(node: Node | null): HTMLSpanElement | null {
        const contentArea = this.contentArea;
        while (node && contentArea && node !== contentArea) {
            if (node instanceof HTMLSpanElement && node.contentEditable === "true") {
                return node;
            }
            node = node.parentNode;
        }
        return null;
    }

    private isTodoItemEmpty(span: HTMLSpanElement): boolean {
        const text = span.textContent?.replace(/\u00A0/g, "").trim() ?? "";
        const html = span.innerHTML.replace(/\u00A0/g, "").trim();
        return text === "" && (html === "" || html === "<br />" || html === "<br>");
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