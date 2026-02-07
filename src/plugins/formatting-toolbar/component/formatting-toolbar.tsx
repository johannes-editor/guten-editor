import { ToolbarUI } from "@components/ui/composites/toolbar";
import { hasSelection, clearSelection } from "@utils/selection";
import { EventTypes } from "@utils/dom";
import { FormattingToolbarItem } from "./formatting-toolbar-item.tsx";

import style from "./style.css?inline"

interface FormattingToolbarProps {
    removeInstance: () => void;
}

export class FormattingToolbar extends ToolbarUI<FormattingToolbarProps> {

    override closeOnClickOutside: boolean = false;
    private selectionRange: Range | null = null;
    private locked: boolean = false;
    private isBackwardSelection: boolean = false;

    private selectionRect: DOMRect | null = null;

    static override styles = this.extendStyles(style);

    static override getTagName() {
        return "guten-formatting-toolbar";
    }

    override onMount(): void {
        requestAnimationFrame(() => {
            this.positionToolbarNearSelection();

            this.selectionRange = globalThis.getSelection()?.getRangeAt(0).cloneRange() ?? null;
            this.captureSelectionRect(this.selectionRange);

        });

        this.registerEvent(document, EventTypes.SelectionChange, () => this.handleSelectionChange());
        this.registerEvent(globalThis, EventTypes.Scroll, () => this.positionToolbarNearSelection());
    }

    override onUnmount(): void {
        this.props.removeInstance();
    }

    handleSelectionChange = () => {
        if (this.locked || hasSelection()) return;

        this.remove();
    }

    // positionToolbarNearSelection(): void {
    //     const selection = globalThis.getSelection();
    //     if (!selection || selection.rangeCount === 0 || selection.toString().trim() === "") {
    //         return;
    //     }

    //     const range = selection.getRangeAt(0);
    //     const rects = range.getClientRects();
    //     if (rects.length === 0) return;

    //     const isBackward = this.isSelectionBackward(selection);

    //     const rect = isBackward
    //         ? rects[0]
    //         : rects[rects.length - 1];

    //     this.setPosition(rect);
    // }

    positionToolbarNearSelection(): void {
        const selection = globalThis.getSelection();
        let range: Range | null = null;

        if (selection && selection.rangeCount > 0 && selection.toString().trim() !== "") {
            range = selection.getRangeAt(0);
            this.isBackwardSelection = this.isSelectionBackward(selection);
        } else if (this.selectionRange) {
            range = this.selectionRange;
        }

        if (!range) return;

        const rects = range.getClientRects();
        if (rects.length === 0) return;

        const rect = this.isBackwardSelection
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

        let leftPosition = rect.left + (rect.width / 2) - (elementWidth / 2);
        let topPosition = rect.top - elementHeight - 10;

        if (leftPosition + elementWidth > globalThis.innerWidth) {
            leftPosition = globalThis.innerWidth - elementWidth - 20;
        }

        if (leftPosition < 20) {
            leftPosition = 20;
        }

        if (topPosition < 0) {
            topPosition = rect.bottom + 10;
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
            this.refreshSelection();
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
        this.isBackwardSelection = this.isSelectionBackward(sel);
    }

    public refreshActiveStates(): void {
        const items = this.querySelectorAll<FormattingToolbarItem>(FormattingToolbarItem.getTagName());
        items.forEach((item) => item.refreshActiveState());
    }

    public isSelectionLocked(): boolean {
        return this.locked;
    }

    public getSelectionRect(): DOMRect | null {
        if (!this.selectionRect) return null;
        return this.cloneDOMRect(this.selectionRect);
    }

    private captureSelectionRect(range: Range | null): void {
        if (!range) {
            this.selectionRect = null;
            return;
        }

        const rects = range.getClientRects();
        if (rects.length === 0) {
            const bounding = range.getBoundingClientRect?.();
            if (bounding && (bounding.width || bounding.height)) {
                this.selectionRect = this.cloneDOMRect(bounding);
                return;
            }

            const container = range.startContainer instanceof Element
                ? range.startContainer
                : range.startContainer?.parentElement ?? null;

            if (container) {
                const fallback = container.getBoundingClientRect();
                if (fallback && (fallback.width || fallback.height)) {
                    this.selectionRect = this.cloneDOMRect(fallback);
                    return;
                }
            }

            this.selectionRect = null;
            return;
        }

        const rect = this.isBackwardSelection
            ? rects[0]
            : rects[rects.length - 1];

        this.selectionRect = this.cloneDOMRect(rect);
    }

    private cloneDOMRect(rect: DOMRect | DOMRectReadOnly): DOMRect {
        if (typeof DOMRect.fromRect === 'function') {
            return DOMRect.fromRect(rect);
        }
        return new DOMRect(rect.x, rect.y, rect.width, rect.height);
    }
}