import { InputPopoverUI, InputPopoverUIProps } from "../../design-system/components/input-popover-ui.tsx";
import { DefaultState } from "../types.ts";

export interface SelectionController {
    lock(): void;
    unlock(): void;
}

export interface InputPopoverProps extends InputPopoverUIProps {
    selectionController?: SelectionController;
}

export abstract class InputPopover<P extends InputPopoverProps, S = DefaultState> extends InputPopoverUI<P, S> {

    private range: DOMRect | null = null;

    override connectedCallback(): void {
        super.connectedCallback();

        this.range = this.getDOMRect();

        requestAnimationFrame(() => {

            if (this.range) {
                this.setPosition(this.range);
            }
        });


        this.props.selectionController?.lock();
    }

    override disconnectedCallback(): void {

        super.disconnectedCallback();
        
        this.props.selectionController?.unlock();
    }


    private getDOMRect(): DOMRect | null {
        const selection = globalThis.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.toString().trim() === "") {
            return null;
        }

        const range = selection.getRangeAt(0);
        const rects = range.getClientRects();
        if (rects.length === 0) return null;

        return rects[0];
    }

    private setPosition(rect: DOMRect): void {
        const elementWidth = this.offsetWidth;
        const elementHeight = this.offsetHeight;

        let leftPosition = rect.left + globalThis.scrollX + (rect.width / 2) - (elementWidth / 2);
        let topPosition = rect.top + globalThis.scrollY - elementHeight - 100;

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

}