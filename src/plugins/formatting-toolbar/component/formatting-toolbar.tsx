/** @jsx h */

import { Toolbar } from "../../../design-system/index.ts";
import { hasSelection } from "../../../utils/selection-utils.ts";
import { EventTypes } from "../../index.ts";

interface FormattingToolbarProps {
    removeToolbarInstance: () => void;
}

export class FormattingToolbar extends Toolbar<FormattingToolbarProps> {

    override closeOnClickOutside: boolean = false;

    static override getTagName() {
        return "guten-formatting-toolbar";
    }

    override onMount(): void {
        requestAnimationFrame(() => {
            this.positionToolbarNearSelection();
        });

        this.registerEvent(document, EventTypes.SelectionChange, () => this.handleSelectionChange());
    }

    override onUnmount(): void {
        this.props.removeToolbarInstance();
    }

    handleSelectionChange = () => {
        if (!hasSelection()) {
            this.remove();
        }
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
        this.style.display = 'flex';
    }
}