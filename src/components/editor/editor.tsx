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
    private titleObserver: MutationObserver | null = null;
    private contentObserver: MutationObserver | null = null;
    private titleTemplate: HTMLElement | null = null;
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
        if (this.titleArea) {
            this.observeTitleChanges();
            this.ensureTitleIntegrity();
        }
        if (this.contentArea) {
            this.observeContentChanges();
            this.ensureContentIntegrity();
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
        if (!this.titleArea || !this.contentArea) return;

        const selection = this.titleArea.ownerDocument.getSelection?.() ?? null;
        if (!selection || selection.rangeCount === 0) return;

        const { startContainer } = selection.getRangeAt(0);
        if (!this.titleArea.contains(startContainer)) return;

        if (event.key === "Backspace" || event.key === "Delete") {
            const titleBlock = this.getTitleBlock();
            if (titleBlock && this.isTitleEmpty(titleBlock)) {
                event.preventDefault();
                this.ensureTitleIntegrity();
            }
            return;
        }

        if (event.key !== "Enter") return;

        event.preventDefault();
        event.stopPropagation();

        const paragraph = this.insertElementAtContentStart(<ParagraphBlock />);
        focusOnElement(paragraph);
    };

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

    private observeContentChanges(): void {
        this.contentObserver?.disconnect();
        if (!this.contentArea) return;

        this.contentObserver = new MutationObserver(() => {
            if (this.isRestoringContent) return;
            this.ensureContentIntegrity();
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
}