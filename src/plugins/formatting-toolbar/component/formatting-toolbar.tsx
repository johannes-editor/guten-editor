/** @jsx h */

import { Toolbar } from "../../../design-system/index.ts";
import { hasSelection, clearSelection } from "../../../utils/selection-utils.ts";
import { EventTypes } from "../../index.ts";

import style from "./style.css?inline"

interface FormattingToolbarProps {
    removeInstance: () => void;
}

export class FormattingToolbar extends Toolbar<FormattingToolbarProps> {

    override closeOnClickOutside: boolean = false;
    private selectionRange: Range | null = null;
    private locked: boolean = false;

    static override styles = this.extendStyles(style);

    static override getTagName() {
        return "guten-formatting-toolbar";
    }

    override onMount(): void {
        requestAnimationFrame(() => {
            this.positionToolbarNearSelection();

            this.selectionRange = window.getSelection()?.getRangeAt(0).cloneRange() ?? null;

        });

        this.registerEvent(document, EventTypes.SelectionChange, () => this.handleSelectionChange());
    }

    override onUnmount(): void {
        this.props.removeInstance();
    }

    handleSelectionChange = () => {
        if (this.locked || hasSelection()) return;

        this.remove();
    }

    positionToolbarNearSelection(): void {
        const selection = globalThis.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.toString().trim() === "") {
            return;
        }

        const range = selection.getRangeAt(0);
        const rects = range.getClientRects();
        if (rects.length === 0) return;

        const isBackward = this.isSelectionBackward(selection);

        const rect = isBackward
            ? rects[0]
            : rects[rects.length - 1];

        this.setPosition(rect);
    }

    private isSelectionBackward(selection: Selection): boolean {
        const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;

        if (!anchorNode || !focusNode) return false;

        if (anchorNode === focusNode) {
            return focusOffset < anchorOffset;
        }

        const position = anchorNode.compareDocumentPosition(focusNode);
        return !!(position & Node.DOCUMENT_POSITION_PRECEDING);
    }

    private setPosition(rect: DOMRect): void {
        const elementWidth = this.offsetWidth;
        const elementHeight = this.offsetHeight;

        let leftPosition = rect.left + globalThis.scrollX + (rect.width / 2) - (elementWidth / 2);
        let topPosition = rect.top + globalThis.scrollY - elementHeight - 10;

        if (leftPosition + elementWidth > globalThis.innerWidth) {
            leftPosition = globalThis.innerWidth - elementWidth - 20;
        }

        if (leftPosition < 20) {
            leftPosition = 20;
        }

        if (topPosition < 0) {
            topPosition = rect.bottom + globalThis.scrollY + 10;
        }

        this.style.left = `${leftPosition}px`;
        this.style.top = `${topPosition}px`;
    }

    public lockSelection(): void {
        if (this.locked) return;

        this.locked = true;

        if (!this.selectionRange) {
            return;
        }

        const hl = new Highlight(this.selectionRange);
        CSS.highlights.set('persist', hl);

        clearSelection();
    }

    public unlockSelection(): void {
        if (!this.locked) return;

        CSS.highlights.delete('persist');

        const root = (this.getRootNode() as Document | ShadowRoot);
        const sel: Selection | null =
            typeof (root as any).getSelection === 'function'
                ? (root as any).getSelection()
                : globalThis.getSelection();

        if (!sel || !this.selectionRange) { this.locked = false; return; }

        if (!this.selectionRange.startContainer.isConnected || !this.selectionRange.endContainer.isConnected) {
            this.locked = false;
            return;
        }

        (this.closest('[contenteditable]') as HTMLElement | null)?.focus({ preventScroll: true });

        sel.removeAllRanges();
        sel.addRange(this.selectionRange);

        this.locked = false;
    }

    public refreshSelection(): void {
        const sel = globalThis.getSelection();
        if (!sel?.rangeCount) return;
        this.selectionRange = sel.getRangeAt(sel.rangeCount - 1).cloneRange();
    }
}