/** @jsx h */

import { BlockquoteEnterHandler } from "../../core/ce-crossbrowser/blockquote-enter-handler.ts";
import { NewContentChildrenObserver } from "../../core/ce-crossbrowser/new-content-children-observer.tsx";
import { PlaceholderObserver } from "../../core/ce-crossbrowser/placeholder-observer.ts";
import { h } from "../../jsx.ts";
import { Component } from "../../plugins/index.ts";
import { ParagraphTrigger } from "../paragraph-trigger/paragraph-trigger.tsx";
import { ParagraphBlock } from "../blocks/paragraph.tsx";
import { focusOnElement } from "../../utils/dom-utils.ts";
import { dom } from "../../utils/index.ts";

import tokens from "../../design-system/tokens.css?inline";
import { themeStyles } from "../../design-system/themes/index.ts";
import primitives from "../../design-system/primitives.css?inline";
import foundation from "../../design-system/foundation.css?inline";

export class Editor extends Component {

    static override getTagName(): string {
        return "x-guten-editor";
    }

    static override styles = [tokens, foundation, primitives, ...themeStyles];

    private editorContent: HTMLElement | null = null;
    private contentArea: HTMLElement | null = null;
    private titleArea: HTMLElement | null = null;
    private overlayArea: HTMLElement | null = null;
    private editorObserver: MutationObserver | null = null;
    private titleObserver: MutationObserver | null = null;
    private contentObserver: MutationObserver | null = null;
    private titleTemplate: HTMLElement | null = null;
    private isRestoringEditor = false;
    private isRestoringTitle = false;
    private isRestoringContent = false;

    private newContentChildrenObserver: NewContentChildrenObserver | null = null;
    private blockquoteEnterHandler: BlockquoteEnterHandler | null = null;
    private placeholderObserver: PlaceholderObserver | null = null;

    override render(): HTMLElement {
        return (
            <div class="editor-container">
                <div id="editorContent" contentEditable="true">
                    <div id="titleArea"></div>
                    <div id="contentArea"></div>
                </div>
                <ParagraphTrigger />
                <div id="overlayArea"></div>
            </div>
        );
    }

    override onMount(): void {
        this.editorContent = document.getElementById("editorContent")!;
        this.titleArea = document.getElementById("titleArea")!;
        this.contentArea = document.getElementById("contentArea")!;
        this.overlayArea = document.getElementById("overlayArea")!;

        if (this.overlayArea) {
            this.overlayArea.style.position = "fixed";
            this.overlayArea.style.top = "0";
            this.overlayArea.style.left = "0";
            this.overlayArea.style.width = "0";
            this.overlayArea.style.height = "0";
            this.overlayArea.style.overflow = "visible";
            this.overlayArea.style.pointerEvents = "none";
            this.overlayArea.style.zIndex = "1000";
        }

        if (this.contentArea) {
            console.log("Editor initialized with content area:", this.contentArea);
            this.newContentChildrenObserver = new NewContentChildrenObserver(this.contentArea);
            this.blockquoteEnterHandler = new BlockquoteEnterHandler(this.contentArea);
            this.placeholderObserver = new PlaceholderObserver(this.editorContent ?? this.contentArea);
        }

        this.newContentChildrenObserver?.start();
        // this.blockquoteEnterHandler?.start();
        this.placeholderObserver?.start();
        if (this.editorContent) {
            this.registerEvent(this.editorContent, dom.EventTypes.KeyDown, this.handleEditorKeyDown as EventListener, true);
        }
        if (this.editorContent) {
            this.observeEditorChanges();
            this.ensureEditorStructureIntegrity();
        }
        if (this.titleArea) {
            this.observeTitleChanges();
            this.ensureTitleIntegrity();
        }
        if (this.contentArea) {
            this.observeContentChanges();
            // this.ensureContentIntegrity();
        }
    }

    public setRoot(root: HTMLElement) {
        root.appendChild(this);

        this.editorContent = document.getElementById("editorContent")!;
        this.titleArea = document.getElementById("titleArea")!;
        this.contentArea = document.getElementById("contentArea")!;
        this.overlayArea = document.getElementById("overlayArea")!;

        if (this.overlayArea) {
            this.overlayArea.style.position = "fixed";
            this.overlayArea.style.top = "0";
            this.overlayArea.style.left = "0";
            this.overlayArea.style.width = "0";
            this.overlayArea.style.height = "0";
            this.overlayArea.style.overflow = "visible";
            this.overlayArea.style.pointerEvents = "none";
        }
    }

    public appendElementOnEditorRoot(element: HTMLElement) {
        this.appendChild(element);
    }

    public appendElementOnContentArea(element: HTMLElement): HTMLElement {
        this.newContentChildrenObserver?.stop();
        this.contentArea?.appendChild(element);
        this.newContentChildrenObserver?.start();

        return element;
    }

    public appendElementOnTitleArea(element: HTMLElement): HTMLElement {
        this.titleArea?.appendChild(element);
        if (!this.titleTemplate) {
            this.titleTemplate = element.cloneNode(true) as HTMLElement;
        }
        this.ensureTitleIntegrity();
        return element;
    }

    public appendElementOnOverlayArea(element: HTMLElement): HTMLElement {
        this.overlayArea?.appendChild(element);

        return element;
    }

    private readonly handleEditorKeyDown = (event: KeyboardEvent) => {

        const isShortcutCombo = event.ctrlKey || event.metaKey || event.altKey;
        if (isShortcutCombo) {
            // IMPORTANT: still allow our multi-block deletion fix if you want it for Ctrl+Backspace/Delete etc.
            // Otherwise, just return.
        }

        if (!this.editorContent || !this.titleArea || !this.contentArea) return;

        const selection = this.editorContent.ownerDocument.getSelection?.() ?? null;
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);

        // If the selection/caret is not inside the editor, do not interfere.
        if (!this.editorContent.contains(range.commonAncestorContainer)) return;

        const inTitle = this.titleArea.contains(range.startContainer);
        const touchesContent = this.selectionTouchesContentArea(selection, range);
        const touchesTitle = this.selectionTouchesTitleArea(selection, range);

        // 1) Fixes multi-block deletion in the content (Firefox / cross-browser)
        if ((event.key === "Backspace" || event.key === "Delete") && touchesContent && !selection.isCollapsed) {
            event.preventDefault();

            this.newContentChildrenObserver?.stop();
            try {
                this.deleteContentSelection(range);

                // If the selection crossed title + content, clear the title.
                if (touchesTitle) {
                    const titleBlock = this.getTitleBlock();
                    if (titleBlock) titleBlock.innerHTML = "<br>";
                }

                this.ensureEditorStructureIntegrity();

                if (touchesTitle) {
                    const titleBlock = this.getTitleBlock();
                    titleBlock ? focusOnElement(titleBlock) : focusOnElement(this.titleArea);
                }

                // Ensures the caret is placed in a valid location after deletion
                //const fallback = this.contentArea.querySelector(".block") as HTMLElement | null;
                //if (fallback) focusOnElement(fallback);
            } finally {
                this.newContentChildrenObserver?.start();
            }

            return;
        }

        // 2) Enter in the title: create the first paragraph in the content and focus it

        if (event.key === "Enter" && inTitle) {
            event.preventDefault();
            event.stopPropagation();

            const paragraph = this.insertElementAtContentStart(<ParagraphBlock />);
            focusOnElement(paragraph);
            return;
        }

        // Any other key: DO NOT interfere (allow normal typing)
    };


    private deleteContentSelection(range: Range): void {
        if (!this.contentArea) return;

        const startBlock = (range.startContainer as HTMLElement).closest?.(".block") as HTMLElement | null;
        const endBlock = (range.endContainer as HTMLElement).closest?.(".block") as HTMLElement | null;

        if (startBlock && endBlock && startBlock === endBlock) {
            range.deleteContents();
            const hasMultipleBlocks = this.contentArea.querySelectorAll(".block").length > 1;
            if (hasMultipleBlocks && this.isBlockEmpty(startBlock)) {
                startBlock.remove();
            }
            return;
        }

        const blocks = Array.from(this.contentArea.querySelectorAll(".block")) as HTMLElement[];
        for (const block of blocks) {
            if (range.intersectsNode(block)) {
                block.remove();
            }
        }
    }

    private selectionTouchesContentArea(selection: Selection, range: Range): boolean {
        if (!this.contentArea) return false;
        if (this.contentArea.contains(range.commonAncestorContainer)) {
            return true;
        }
        if (typeof selection.containsNode === "function") {
            return selection.containsNode(this.contentArea, true);
        }
        if (typeof range.intersectsNode === "function") {
            return range.intersectsNode(this.contentArea);
        }

        const contentRange = this.contentArea.ownerDocument.createRange();
        contentRange.selectNodeContents(this.contentArea);
        const startsBeforeContentEnd = range.compareBoundaryPoints(Range.START_TO_END, contentRange) < 0;
        const endsAfterContentStart = range.compareBoundaryPoints(Range.END_TO_START, contentRange) > 0;
        return startsBeforeContentEnd && endsAfterContentStart;
    }

    private selectionTouchesTitleArea(selection: Selection, range: Range): boolean {
        if (!this.titleArea) return false;
        if (this.titleArea.contains(range.commonAncestorContainer)) {
            return true;
        }
        if (typeof selection.containsNode === "function") {
            return selection.containsNode(this.titleArea, true);
        }
        if (typeof range.intersectsNode === "function") {
            return range.intersectsNode(this.titleArea);
        }

        const titleRange = this.titleArea.ownerDocument.createRange();
        titleRange.selectNodeContents(this.titleArea);
        const startsBeforeTitleEnd = range.compareBoundaryPoints(Range.START_TO_END, titleRange) < 0;
        const endsAfterTitleStart = range.compareBoundaryPoints(Range.END_TO_START, titleRange) > 0;
        return startsBeforeTitleEnd && endsAfterTitleStart;
    }

    private insertElementAtContentStart(element: HTMLElement): HTMLElement {
        this.newContentChildrenObserver?.stop();
        if (this.contentArea) {
            this.contentArea.prepend(element);
        }
        this.newContentChildrenObserver?.start();
        return element;
    }

    private observeTitleChanges(): void {
        this.titleObserver?.disconnect();
        if (!this.titleArea) return;

        this.titleObserver = new MutationObserver(() => {
            if (this.isRestoringTitle) return;
            this.ensureTitleIntegrity();
        });
        this.startTitleObserver();
    }

    private startTitleObserver(): void {
        if (!this.titleObserver || !this.titleArea) return;
        this.titleObserver.observe(this.titleArea, {
            childList: true,
            subtree: true,
            characterData: true,
        });
    }

    private stopTitleObserver(): void {
        this.titleObserver?.disconnect();
    }

    private observeEditorChanges(): void {
        this.editorObserver?.disconnect();
        if (!this.editorContent) return;

        this.editorObserver = new MutationObserver(() => {
            if (this.isRestoringEditor) return;
            this.ensureEditorStructureIntegrity();
        });
        this.startEditorObserver();
    }

    private startEditorObserver(): void {
        if (!this.editorObserver || !this.editorContent) return;
        this.editorObserver.observe(this.editorContent, {
            childList: true,
            subtree: false,
        });
    }

    private stopEditorObserver(): void {
        this.editorObserver?.disconnect();
    }

    private observeContentChanges(): void {
        this.contentObserver?.disconnect();
        if (!this.contentArea) return;

        this.contentObserver = new MutationObserver(() => {
            if (this.isRestoringContent) return;
            // this.ensureContentIntegrity();
        });
        this.startContentObserver();
    }

    private startContentObserver(): void {
        if (!this.contentObserver || !this.contentArea) return;
        this.contentObserver.observe(this.contentArea, {
            childList: true,
            subtree: true,
            characterData: true,
        });
    }

    private stopContentObserver(): void {
        this.contentObserver?.disconnect();
    }

    private ensureEditorStructureIntegrity(): void {
        if (!this.editorContent) return;

        if (!this.titleArea) {
            const title = document.getElementById("titleArea");
            this.titleArea = title ?? document.createElement("div");
            this.titleArea.id = "titleArea";
        }

        if (!this.contentArea) {
            const content = document.getElementById("contentArea");
            this.contentArea = content ?? document.createElement("div");
            this.contentArea.id = "contentArea";
        }

        const titleArea = this.titleArea;
        const contentArea = this.contentArea;
        const nodes = Array.from(this.editorContent.childNodes);
        const hasUnexpectedNodes = nodes.some((node) => node !== titleArea && node !== contentArea);
        const missingNodes = !this.editorContent.contains(titleArea) || !this.editorContent.contains(contentArea);
        const orderInvalid = this.editorContent.firstChild !== titleArea
            || this.editorContent.lastChild !== contentArea
            || this.editorContent.childNodes.length !== 2;

        if (hasUnexpectedNodes || missingNodes || orderInvalid) {
            this.isRestoringEditor = true;
            this.stopEditorObserver();
            this.stopTitleObserver();
            this.stopContentObserver();
            this.editorContent.replaceChildren(titleArea, contentArea);
            this.startTitleObserver();
            this.startContentObserver();
            this.startEditorObserver();
            this.isRestoringEditor = false;
        }

        this.ensureTitleIntegrity();
        // this.ensureContentIntegrity();
    }

    private ensureTitleIntegrity(): void {
        if (!this.titleArea) return;

        let titleBlock = this.getTitleBlock();
        if (!titleBlock) {
            if (this.titleTemplate) {
                this.isRestoringTitle = true;
                this.stopTitleObserver();
                titleBlock = this.titleTemplate.cloneNode(true) as HTMLElement;
                titleBlock.innerHTML = "<br>";
                this.titleArea.replaceChildren(titleBlock);
                this.startTitleObserver();
                this.isRestoringTitle = false;
            }
            return;
        }

        if (this.isTitleEmpty(titleBlock)) {
            this.isRestoringTitle = true;
            this.stopTitleObserver();
            titleBlock.innerHTML = "<br>";
            this.startTitleObserver();
            this.isRestoringTitle = false;
        }
    }

    private ensureContentIntegrity(): void {
        if (!this.contentArea) return;

        const hasBlock = Boolean(this.contentArea.querySelector(".block"));
        if (hasBlock) return;

        this.isRestoringContent = true;
        this.stopContentObserver();
        this.insertElementAtContentStart(<ParagraphBlock />);
        this.startContentObserver();
        this.isRestoringContent = false;
    }

    private getTitleBlock(): HTMLElement | null {
        return this.titleArea?.querySelector(".block") as HTMLElement | null;
    }

    private isTitleEmpty(titleBlock: HTMLElement): boolean {
        const text = titleBlock.textContent?.replace(/[\s\u00A0\u200B]+/g, "") ?? "";
        return text.length === 0;
    }

    private isBlockEmpty(block: HTMLElement): boolean {
        const text = block.textContent?.replace(/[\s\u00A0\u200B]+/g, "") ?? "";
        return text.length === 0;
    }
}