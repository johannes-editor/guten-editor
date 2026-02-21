

import { DefaultState } from "@core/components";
import { EventTypes } from "@utils/dom";
import { InputPopoverUI, InputPopoverUIProps } from "./input-popover-ui.tsx";

export interface SelectionController {
    lock(): void;
    unlock(): void;
}

export interface InputPopoverProps extends InputPopoverUIProps {
    selectionController?: SelectionController;
    anchorRect?: DOMRectInit | null;
}

export abstract class InputPopover<P extends InputPopoverProps, S = DefaultState> extends InputPopoverUI<P, S> {

    private anchorRect: DOMRect | null = null;
    private anchorRange: Range | null = null;

    private selectionLocked = false;
    private closing = false;

    private repositionFrame: number | null = null;

    override connectedCallback(): void {
        this.closing = false;
        super.connectedCallback();

        if (this.closing) {
            return;
        }

        if (this.props.anchorRect) {
            this.anchorRect = this.toDOMRect(this.props.anchorRect);
        } else {
            this.anchorRange = this.getCurrentSelectionRange();
        }

        const initialRect = this.resolveAnchorRect();
        if (initialRect) {
            this.setPosition(initialRect);
        }

        requestAnimationFrame(() => {
            const nextRect = this.resolveAnchorRect();
            if (nextRect) {
                this.setPosition(nextRect);
            }
        });


        if (this.props.selectionController) {
            this.props.selectionController.lock();
            this.selectionLocked = true;
        }

        this.registerEvent(globalThis, EventTypes.Scroll, this.handleViewportChange as EventListener, true);
        this.registerEvent(globalThis, EventTypes.Resize, this.handleViewportChange as EventListener);
    }

    override disconnectedCallback(): void {

        this.unlockSelection();

        super.disconnectedCallback();
    }

    override remove(): void {
        this.closing = true;
        this.unlockSelection();
        super.remove();
    }

    private unlockSelection(): void {
        if (!this.selectionLocked) return;
        this.selectionLocked = false;
        this.props.selectionController?.unlock();
    }


    private getDOMRect(): DOMRect | null {
        const selection = globalThis.getSelection();
        if (!selection || selection.rangeCount === 0) return null;

        return this.getDOMRectFromRange(selection.getRangeAt(0));
    }

    public setPosition(rect: DOMRect): void {
        const elementWidth = this.offsetWidth;
        const elementHeight = this.offsetHeight;

        let leftPosition = rect.left + (rect.width / 2) - (elementWidth / 2);
        let topPosition = rect.bottom + 10;

        if (leftPosition + elementWidth > globalThis.innerWidth) {
            leftPosition = globalThis.innerWidth - elementWidth - 20;
        }

        if (leftPosition < 20) {
            leftPosition = 20;
        }

        if (topPosition + elementHeight > globalThis.innerHeight) {
            topPosition = rect.top - elementHeight - 10;
        }

        this.style.left = `${leftPosition}px`;
        this.style.top = `${topPosition}px`;
    }

    private toDOMRect(rectInit: DOMRectInit): DOMRect {
        const x = rectInit.x ?? 0;
        const y = rectInit.y ?? 0;
        const width = rectInit.width ?? 0;
        const height = rectInit.height ?? 0;

        return typeof DOMRect.fromRect === "function"
            ? DOMRect.fromRect({ x, y, width, height })
            : new DOMRect(x, y, width, height);
    }

    private handleViewportChange = () => {
        if (!this.isConnected || this.closing) return;

        if (this.repositionFrame !== null) {
            cancelAnimationFrame(this.repositionFrame);
        }

        this.repositionFrame = requestAnimationFrame(() => {
            this.repositionFrame = null;

            const nextRange = this.resolveAnchorRect();
            if (!nextRange) return;

            this.setPosition(nextRange);
        });
    };

    private resolveAnchorRect(): DOMRect | null {
        if (this.anchorRect) return this.anchorRect;
        if (this.anchorRange) return this.getDOMRectFromRange(this.anchorRange);
        return this.getDOMRect();
    }
    
    private getDOMRectFromRange(range: Range): DOMRect | null {
        if (!range.startContainer?.isConnected || !range.endContainer?.isConnected) {
            return null;
        }

        const br = range.getBoundingClientRect?.();
        if (br && (br.width || br.height)) return br as DOMRect;

        const startElement = range.startContainer instanceof Element
            ? range.startContainer
            : range.startContainer?.parentElement;

        if (startElement) {
            const r = startElement.getBoundingClientRect();
            if (r && (r.width || r.height)) return r as DOMRect;
        }

        return null;
    }

    private getCurrentSelectionRange(): Range | null {
        const selection = globalThis.getSelection();
        if (!selection || selection.rangeCount === 0) return null;

        try {
            return selection.getRangeAt(0).cloneRange();
        } catch {
            return null;
        }
    }
}