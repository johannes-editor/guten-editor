export interface Block {
    id: string;
    type: string;
    text: string;
}

/**
 * Simple document model that mirrors the DOM structure.
 * Each block represents a direct child element of the editor content area.
 */
export class DocumentModel {
    public blocks: Block[] = [];

    constructor(root?: HTMLElement) {
        if (root) {
            this.fromDOM(root);
        }
    }

    /**
     * Rebuild the model from the given DOM root.
     */
    fromDOM(root: HTMLElement) {
        this.blocks = Array.from(root.children).map((el, idx) => ({
            id: el.id || `block-${idx}`,
            type: el.tagName.toLowerCase(),
            text: el.textContent ?? "",
        }));
    }

    /**
     * Render the current model back into the DOM root.
     * The entire content area is replaced for simplicity.
     */
    render(root: HTMLElement) {
        const frag = document.createDocumentFragment();
        for (const block of this.blocks) {
            const el = document.createElement(block.type);
            el.id = block.id;
            el.textContent = block.text;
            frag.appendChild(el);
        }
        root.replaceChildren(frag);
    }
}
