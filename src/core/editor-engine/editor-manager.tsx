/** @jsx h */

import { h } from "../../jsx.ts";
import { ParagraphTrigger } from "../../components/paragraph-trigger/paragraph-trigger.tsx";
import { BlockquoteEnterHandler } from "../ce-crossbrowser/blockquote-enter-handler.ts";
import { NewContentChildrenObserver } from "../ce-crossbrowser/new-content-children-observer.ts";
import { PlaceholderObserver } from "../ce-crossbrowser/placeholder-observer.ts";

export class EditorManager {

    private editorRoot: HTMLElement | null;
    private content: HTMLElement | null;
    private overlay: HTMLElement | null;

    private newContentChildrenObserver: NewContentChildrenObserver | null = null;
    private blockquoteEnterHandler: BlockquoteEnterHandler | null = null;
    private placeholderObserver: PlaceholderObserver | null = null;

    constructor() {
        this.editorRoot = null;
        this.content = null;
        this.overlay = null;
    }

    public setRoot(root: HTMLElement) {
        this.editorRoot = root;

        this.createContentArea(root);
        this.appendElementOnEditorRoot(<ParagraphTrigger />)
        this.createOverlayNode(root);

        if (this.content) {
            this.newContentChildrenObserver = new NewContentChildrenObserver(this.content);
            this.blockquoteEnterHandler = new BlockquoteEnterHandler(this.content);
            this.placeholderObserver = new PlaceholderObserver(this.content);
        }

        this.newContentChildrenObserver?.start();
        // this.blockquoteEnterHandler?.start();
        this.placeholderObserver?.start();
    }

    public appendElementOnEditorRoot(element: HTMLElement) {
        this.editorRoot?.appendChild(element);
    }

    public appendElementOnContentArea(element: HTMLElement): HTMLElement {
        this.newContentChildrenObserver?.stop();
        this.content?.appendChild(element);
        this.newContentChildrenObserver?.start();

        return element;
    }

    public appendElementOnOverlayArea(element: HTMLElement): HTMLElement {
        this.overlay?.appendChild(element);

        return element;
    }

    private createContentArea(root: HTMLElement) {
        this.content = document.createElement("div");
        this.content.setAttribute("contentEditable", "true");
        this.content.id = "contentArea";

        root.appendChild(this.content);
    }

    private createOverlayNode(root: HTMLElement) {
        this.overlay = document.createElement("div");
        this.overlay.id = "overlayArea";

        root.appendChild(this.overlay);
    }

}