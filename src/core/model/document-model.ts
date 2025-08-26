export interface Mark {
    tag: string;
    start: number;
    end: number;
}

export interface Block {
    id: string;
    type: string;
    text: string;
    marks?: Mark[];
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
        this.blocks = Array.from(root.children).map((el, idx) => {
            const id = el.id || `block-${idx}`;
            const type = el.tagName.toLowerCase();
            const textParts: string[] = [];
            const marks: Mark[] = [];

            let offset = 0;
            const walk = (node: Node, active: string[]) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent ?? "";
                    textParts.push(text);
                    const start = offset;
                    offset += text.length;
                    const end = offset;
                    for (const tag of active) {
                        marks.push({ tag, start, end });
                    }
                } else if (node instanceof Element) {
                    const tagName = node.tagName.toLowerCase();
                    const next = [
                        ...active,
                        ...(tagName === "b" || tagName === "i" || tagName === "u" || tagName === "s"
                            ? [tagName]
                            : []),
                    ];
                    node.childNodes.forEach((child) => walk(child, next));
                }
            };

            walk(el, []);
            return { id, type, text: textParts.join(""), marks } as Block;
        });
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
            if (!block.marks || block.marks.length === 0) {
                el.textContent = block.text;
            } else {
                const opens: Record<number, string[]> = {};
                const closes: Record<number, string[]> = {};
                for (const m of block.marks) {
                    (opens[m.start] ||= []).push(m.tag);
                    (closes[m.end] ||= []).push(m.tag);
                }
                let html = "";
                for (let i = 0; i < block.text.length; i++) {
                    if (opens[i]) {
                        for (const tag of opens[i]) html += `<${tag}>`;
                    }
                    html += escapeHTML(block.text[i]);
                    if (closes[i + 1]) {
                        for (const tag of [...closes[i + 1]].reverse()) html += `</${tag}>`;
                    }
                }
                if (closes[block.text.length]) {
                    for (const tag of [...closes[block.text.length]].reverse()) html += `</${tag}>`;
                }
                el.innerHTML = html;
            }
            frag.appendChild(el);
        }
        root.replaceChildren(frag);
    }
}

function escapeHTML(str: string): string {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}
