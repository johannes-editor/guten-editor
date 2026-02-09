
import { Plugin } from "@core/plugin-engine";
import { InsertResultContext, PasteBlockInstruction, PasteBlocksEventDetail, runCommand } from "@core/command";
import { getCurrentSelectionRange, findClosestBlockBySelection } from "@utils/selection";
import { isEquationElement } from "@plugins/equation/utils/equation-element.ts";

export const PASTE_BLOCKS_EVENT = "guten:paste-blocks";

export class PasteHandlerPlugin extends Plugin {

    private contentArea: HTMLElement | null = null;

    private readonly instructionCommandMap: Record<string, string> = {
        paragraph: "insertParagraph",
        h1: "insertHeading1",
        h2: "insertHeading2",
        h3: "insertHeading3",
        h4: "insertHeading4",
        h5: "insertHeading5",
        blockquote: "insertBlockquote",
        "unordered-list": "insertBulletedList",
        "ordered-list": "insertNumberedList",
        separator: "insertSeparator",
        callout: "insertCallout",
        image: "insertImageBlock",
        "code-block": "insertCodeBlock",
    };

    private readonly onPaste = (event: ClipboardEvent) => {
        const clipboard = event.clipboardData;
        if (!clipboard) return;

        const plainText = clipboard.getData("text/plain") ?? "";
        const htmlText = clipboard.getData("text/html")?.trim() ?? "";

        if (!htmlText) {
            event.preventDefault();
            this.insertPlainText(plainText);
            return;
        }

        const doc = new DOMParser().parseFromString(htmlText, "text/html");
        const body = doc.body;

        if (!this.containsBlockLevelContent(body)) {
            event.preventDefault();
            const fragment = this.sanitizeInlineContent(body);
            this.insertFragment(fragment);
            return;
        }

        event.preventDefault();
        const instructions = this.extractBlockInstructions(body);

        this.applyBlockInstructions(instructions);

        const detail: PasteBlocksEventDetail = { instructions };
        const target = this.contentArea ?? document;


        console.log("Instructions", instructions);


        target.dispatchEvent(new CustomEvent<PasteBlocksEventDetail>(PASTE_BLOCKS_EVENT, { detail }));
    };

    override setup(root: HTMLElement): void {
        this.contentArea = root.querySelector("#contentArea") ?? document.getElementById("contentArea");
        const target = this.contentArea ?? root;
        target.addEventListener("paste", this.onPaste);
    }

    private applyBlockInstructions(instructions: PasteBlockInstruction[]) {
        if (!instructions.length) return;

        const context: InsertResultContext = { afterBlock: findClosestBlockBySelection() };

        instructions.forEach((instruction, index) => {
            const commandId = this.instructionCommandMap[instruction.type];
            if (!commandId) return;

            context.instruction = instruction;
            context.focus = index === instructions.length - 1;

            // For separators, we don't want a trailing paragraph.
            context.createTrailingParagraph = instruction.type === "separator" ? false : undefined;

            runCommand(commandId, { content: context, selection: globalThis.getSelection?.() ?? undefined, root: this.contentArea ?? undefined });
        });
    }

    private insertPlainText(text: string) {
        const clean = this.cleanPlainText(text);
        const selection = globalThis.getSelection();

        if (selection && typeof document.execCommand === "function") {
            document.execCommand("insertText", false, clean);
            return;
        }

        const range = getCurrentSelectionRange();
        if (!range) return;

        const node = document.createTextNode(clean);
        range.deleteContents();
        range.insertNode(node);
        this.moveCaretAfter(node);
    }

    private insertFragment(fragment: DocumentFragment) {
        const range = getCurrentSelectionRange();
        if (!range) return;

        const insertedNodes = Array.from(fragment.childNodes);

        range.deleteContents();
        range.insertNode(fragment);

        const last = insertedNodes[insertedNodes.length - 1];
        if (last) {
            this.moveCaretAfter(last);
        }
    }

    private moveCaretAfter(node: Node) {
        const selection = globalThis.getSelection();
        if (!selection) return;

        const range = document.createRange();
        range.setStartAfter(node);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    private sanitizeInlineContent(source: HTMLElement): DocumentFragment {
        const fragment = document.createDocumentFragment();
        for (const child of Array.from(source.childNodes)) {
            this.appendInlineNode(child, fragment);
        }
        return fragment;
    }

    private appendInlineNode(node: Node, target: DocumentFragment | HTMLElement) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = this.cleanInlineText(node.textContent ?? "");
            if (text) target.appendChild(document.createTextNode(text));
            return;
        }

        if (!(node instanceof HTMLElement)) return;

        const el = node as unknown as HTMLElement;

        if (el.tagName === "A") {
            const href = this.sanitizeUrl(node.getAttribute("href"));
            if (!href) {
                const text = this.cleanInlineText(node.textContent ?? "");
                if (text) target.appendChild(document.createTextNode(text));
                return;
            }

            const link = document.createElement("a");
            link.textContent = this.cleanInlineText(node.textContent ?? "");
            link.href = href;
            link.rel = "noopener noreferrer";
            link.target = "_blank";
            target.appendChild(link);
            return;
        }

        if (el.tagName === "CODE") {
            const code = document.createElement("code");
            code.textContent = this.cleanInlineText(node.textContent ?? "");
            target.appendChild(code);
            return;
        }

        if (isEquationElement(el)) {
            const inline = document.createElement("guten-inline-equation");
            const latex = node.getAttribute("data-latex") ?? this.cleanInlineText(node.textContent ?? "");
            inline.dataset.latex = latex;
            inline.dataset.displayMode = "inline";
            inline.setAttribute("contenteditable", "false");
            inline.textContent = latex;
            target.appendChild(inline);
            return;
        }

        if (node.childNodes.length > 0) {
            for (const child of Array.from(node.childNodes)) {
                this.appendInlineNode(child, target);
            }
        }
    }

    private containsBlockLevelContent(element: HTMLElement): boolean {
        const blockTags = new Set([
            "P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "LI", "BLOCKQUOTE", "PRE", "TABLE", "TR", "TD", "TH", "HR", "FIGURE"
        ]);

        const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT, {
            acceptNode: (node) => {
                const el = node as HTMLElement;
                if (blockTags.has(el.tagName)) return NodeFilter.FILTER_ACCEPT;
                if (isEquationElement(el) && el.dataset.displayMode === "block") return NodeFilter.FILTER_ACCEPT;
                return NodeFilter.FILTER_SKIP;
            }
        });

        return Boolean(walker.nextNode());
    }

    private extractBlockInstructions(element: HTMLElement): PasteBlockInstruction[] {
        const instructions: PasteBlockInstruction[] = [];
        for (const child of Array.from(element.childNodes)) {
            this.collectFromNode(child, instructions);
        }
        return instructions;
    }

    private collectFromNode(node: Node, instructions: PasteBlockInstruction[]) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = this.cleanBlockText(node.textContent ?? "");
            if (text) instructions.push({ type: "paragraph", content: text });
            return;
        }

        if (!(node instanceof HTMLElement)) return;

        if (this.containsBlockLevelContent(node) && !this.isBlockElement(node)) {
            for (const child of Array.from(node.childNodes)) {
                this.collectFromNode(child, instructions);
            }
            return;
        }

        const blockInstruction = this.convertBlockElement(node);
        if (blockInstruction) {
            if (Array.isArray(blockInstruction)) {
                instructions.push(...blockInstruction);
            } else {
                instructions.push(blockInstruction);
            }
            return;
        }

        if (node.childNodes.length && this.containsBlockLevelContent(node)) {
            for (const child of Array.from(node.childNodes)) {
                this.collectFromNode(child, instructions);
            }
            return;
        }

        const fallback = this.cleanBlockText(node.textContent ?? "");
        if (fallback) instructions.push({ type: "paragraph", content: fallback });
    }

    private convertBlockElement(element: HTMLElement): PasteBlockInstruction | PasteBlockInstruction[] | null {
        const tag = element.tagName;

        if (tag === "P") return { type: "paragraph", content: this.cleanBlockText(element.textContent ?? "") };

        if (tag === "H1" || tag === "H2" || tag === "H3" || tag === "H4" || tag === "H5") {
            const level = tag.toLowerCase();
            return { type: level, content: this.cleanBlockText(element.textContent ?? "") };
        }

        if (tag === "UL" || tag === "OL") {
            const listData = this.parseList(element as HTMLUListElement | HTMLOListElement);
            if (listData.items.length === 0) return null;
            return { type: listData.type, items: listData.items };
        }

        if (tag === "BLOCKQUOTE") return { type: "blockquote", content: this.cleanBlockText(element.textContent ?? "") };

        if (tag === "PRE" && element.querySelector("code")) {
            return { type: "code-block", content: this.cleanCodeText(element.textContent ?? "") };
        }

        if (isEquationElement(element) && element.dataset.displayMode === "block") {
            const latex = element.getAttribute("data-latex") ?? this.cleanBlockText(element.textContent ?? "");
            return { type: "math-block", content: latex };
        }

        if (element.classList.contains("callout")) {
            return { type: "callout", content: this.cleanBlockText(element.textContent ?? "") };
        }

        if (tag === "TABLE") {
            const rows = this.parseTable(element);
            return { type: "table", rows };
        }

        if (tag === "IMG") {
            const src = this.sanitizeUrl(element.getAttribute("src"));
            if (!src) return null;
            const alt = this.cleanInlineText(element.getAttribute("alt") ?? "");
            return { type: "image", content: alt, attrs: { src, alt } };
        }

        if (tag === "HR") return { type: "separator" };

        const youtubeUrl = this.findYouTubeLink(element);
        if (youtubeUrl) return { type: "youtube", content: youtubeUrl };

        return null;
    }

    private isBlockElement(element: HTMLElement): boolean {
        return [
            "P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "LI", "BLOCKQUOTE", "PRE", "TABLE", "HR", "IMG"
        ].includes(element.tagName) || isEquationElement(element);
    }

    private parseList(list: HTMLUListElement | HTMLOListElement): { type: string; items: Array<{ text: string; checked?: boolean }> } {
        const items: Array<{ text: string; checked?: boolean }> = [];
        let type: string = list.tagName === "OL" ? "ordered-list" : "unordered-list";

        for (const li of Array.from(list.querySelectorAll<HTMLElement>("li"))) {
            const check = li.querySelector<HTMLInputElement>('input[type="checkbox"]');
            if (check) type = "todo-list";
            const clone = li.cloneNode(true) as HTMLElement;
            clone.querySelectorAll('input[type="checkbox"]').forEach(el => el.remove());
            const text = this.cleanBlockText(clone.textContent ?? "");
            if (!text) continue;
            items.push({ text, checked: check?.checked ?? false });
        }

        return { type, items };
    }

    private parseTable(table: HTMLElement): string[][] {
        const rows: string[][] = [];
        const trs = table.querySelectorAll<HTMLTableRowElement>("tr");
        for (const tr of Array.from(trs)) {
            const cols: string[] = [];
            const cells = tr.querySelectorAll<HTMLTableCellElement>("th,td");
            for (const cell of Array.from(cells)) {
                cols.push(this.cleanBlockText(cell.textContent ?? ""));
            }
            if (cols.length) rows.push(cols);
        }
        return rows;
    }

    private findYouTubeLink(element: HTMLElement): string | null {
        if (element.tagName === "A") {
            const selfHref = this.sanitizeUrl(element.getAttribute("href"));
            if (selfHref && this.isYouTubeUrl(selfHref)) return selfHref;
        }

        if (element.tagName === "IFRAME") {
            const src = this.sanitizeUrl(element.getAttribute("src"));
            if (src && this.isYouTubeUrl(src)) return src;
        }

        const links = element.querySelectorAll<HTMLAnchorElement>("a[href]");
        for (const link of Array.from(links)) {
            const href = this.sanitizeUrl(link.getAttribute("href"));
            if (href && this.isYouTubeUrl(href)) return href;
        }

        return null;
    }

    private sanitizeUrl(url: string | null | undefined): string | null {
        if (!url) return null;

        try {
            const parsed = new URL(url, globalThis.location?.href ?? "http://localhost");
            if (["http:", "https:"].includes(parsed.protocol)) {
                return parsed.toString();
            }
        } catch { /* ignored */ }

        return null;
    }

    private isYouTubeUrl(url: string): boolean {
        try {
            const parsed = new URL(url);
            return ["youtube.com", "www.youtube.com", "youtu.be"].includes(parsed.hostname);
        } catch {
            return false;
        }
    }

    private cleanInlineText(text: string): string {
        return text
            .replace(/\u00A0/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    private cleanPlainText(text: string): string {
        return text
            .replace(/\u00A0/g, " ")
            .replace(/\r\n?/g, "\n");
    }

    private cleanBlockText(text: string): string {
        return text
            .replace(/\u00A0/g, " ")
            .replace(/\r\n?/g, "\n")
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean)
            .join("\n");
    }

    private cleanCodeText(text: string): string {
        return text
            .replace(/\u00A0/g, " ")
            .replace(/\r\n?/g, "\n")
            .trimEnd();
    }
}