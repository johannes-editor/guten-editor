import { OverlayComponent } from "../../components/overlay-component.ts";
import { BlockquoteEnterHandler } from "../ce-crossbrowser/blockquote-enter-handler.ts";
import { NewContentChildrenObserver } from "../ce-crossbrowser/new-content-children-observer.ts";
import { PlaceholderObserver } from "../ce-crossbrowser/placeholder-observer.ts";

export class EditorManager {

    private editorRoot: HTMLElement | null;
    private content: HTMLElement | null;

    private newContentChildrenObserver: NewContentChildrenObserver | null = null;
    private blockquoteEnterHandler: BlockquoteEnterHandler | null = null;
    private placeholderObserver : PlaceholderObserver | null = null;

    constructor() {
        this.editorRoot = null;
        this.content = null;
    }

    public setRoot(root: HTMLElement) {
        this.editorRoot = root;

        this.createContentNode(root);

        if (this.content) {
            this.newContentChildrenObserver = new NewContentChildrenObserver(this.content);
            this.blockquoteEnterHandler = new BlockquoteEnterHandler(this.content);
            this.placeholderObserver = new PlaceholderObserver(this.content);
        }

        this.newContentChildrenObserver?.start();
        this.blockquoteEnterHandler?.start();
        this.placeholderObserver?.start();
    }

    public appendChildren(element: Node) {
        this.newContentChildrenObserver?.stop();
        this.content?.appendChild(element);
        this.newContentChildrenObserver?.start();
    }

    private createContentNode(root: HTMLElement) {
        this.content = document.createElement("div");
        this.content.setAttribute("contentEditable", "true");
        this.content.id = "content";

        root.appendChild(this.content);
    }

    public appendOverlay(element: OverlayComponent) {
        this.editorRoot?.appendChild(element);
    }
}