

import { DefaultState } from "@core/components";
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

    private range: DOMRect | null = null;
    private selectionLocked = false;
    private closing = false;

    override connectedCallback(): void {
        this.closing = false;
        super.connectedCallback();

        if (this.closing) {
            return;
        }

        this.range = this.props.anchorRect ? this.toDOMRect(this.props.anchorRect) : this.getDOMRect();

        if (this.range) {
            this.setPosition(this.range);
        }

        requestAnimationFrame(() => {

            if (this.range) {
                this.setPosition(this.range);
            }
        });


        if (this.props.selectionController) {
            this.props.selectionController.lock();
            this.selectionLocked = true;
        }
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

        const range = selection.getRangeAt(0);

        const rects = range.getClientRects();
        if (rects.length > 0) return rects[0];

        const br = range.getBoundingClientRect?.();
        if (br && (br.width || br.height)) return br as DOMRect;

        const el = (range.startContainer instanceof Element
            ? range.startContainer
            : range.startContainer?.parentElement) as Element | null;

        if (el) {
            const r = el.getBoundingClientRect();
            if (r && (r.width || r.height)) return r as DOMRect;
        }
        return null;
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
}