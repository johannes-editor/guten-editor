/** @jsx h */

import { BlockquoteEnterHandler } from "../../core/ce-crossbrowser/blockquote-enter-handler.ts";
import { NewContentChildrenObserver } from "../../core/ce-crossbrowser/new-content-children-observer.tsx";
import { PlaceholderObserver } from "../../core/ce-crossbrowser/placeholder-observer.ts";
import { h } from "../../jsx.ts";
import { Component } from "../../plugins/index.ts";
import { ParagraphTrigger } from "../paragraph-trigger/paragraph-trigger.tsx";

import tokens from "../../design-system/tokens.css?inline";
import primitives from "../../design-system/primitives.css?inline";

export class Editor extends Component {

    static override getTagName(): string {
        return "guten-editor";
    }

    static override styles = [tokens, primitives];

    private contentArea: HTMLElement | null = null;
    private overlayArea: HTMLElement | null = null;

    private newContentChildrenObserver: NewContentChildrenObserver | null = null;
    private blockquoteEnterHandler: BlockquoteEnterHandler | null = null;
    private placeholderObserver: PlaceholderObserver | null = null;

    override render(): HTMLElement {
        return (
            <div class="editor-container">
                <div id="contentArea" contentEditable="true"></div>
                <ParagraphTrigger />
                <div id="overlayArea"></div>
            </div>
        );
    }

    override onMount(): void {
        this.contentArea = document.getElementById("contentArea")!;
        this.overlayArea = document.getElementById("overlayArea")!;

        if (this.contentArea) {

            console.log("Editor initialized with content area:", this.contentArea);
            this.newContentChildrenObserver = new NewContentChildrenObserver(this.contentArea);
            this.blockquoteEnterHandler = new BlockquoteEnterHandler(this.contentArea);
            this.placeholderObserver = new PlaceholderObserver(this.contentArea);
        }

        this.newContentChildrenObserver?.start();
        // this.blockquoteEnterHandler?.start();
        this.placeholderObserver?.start();
    }

    public setRoot(root: HTMLElement) {
        root.appendChild(this);

        this.contentArea = document.getElementById("contentArea")!;
        this.overlayArea = document.getElementById("overlayArea")!;
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

    public appendElementOnOverlayArea(element: HTMLElement): HTMLElement {
        this.overlayArea?.appendChild(element);

        return element;
    }
}