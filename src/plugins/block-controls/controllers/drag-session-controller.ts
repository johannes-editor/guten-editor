import { EventTypes } from "@utils/dom/events.ts";

interface DragSessionControllerCallbacks {
    onDragStart: () => void;
    onDragEnd: (draggedBlock: HTMLElement) => void;
}

export class DragSessionController {

    private currentDrag: HTMLElement | null = null;
    private placeholder: HTMLElement | null = null;
    private dragControl: HTMLButtonElement | null = null;

    constructor(
        private content: HTMLElement,
        private callbacks: DragSessionControllerCallbacks,
    ) { }

    isDragging(): boolean {
        return this.currentDrag !== null;
    }

    startDrag(block: HTMLElement | null, dragControl: HTMLButtonElement | null): boolean {
        if (!block || this.currentDrag) return false;

        this.currentDrag = block;
        this.dragControl = dragControl;
        this.createPlaceholder();
        this.currentDrag.style.opacity = '0.5';
        this.currentDrag.style.pointerEvents = 'none';

        if (this.dragControl) this.dragControl.style.cursor = 'grabbing';
        document.body.style.cursor = 'grabbing';

        document.addEventListener(EventTypes.PointerMove, this.onPointerMove);
        document.addEventListener(EventTypes.PointerUp, this.onPointerUp);
        this.callbacks.onDragStart();

        return true;
    }

    dispose(): void {
        document.removeEventListener(EventTypes.PointerMove, this.onPointerMove);
        document.removeEventListener(EventTypes.PointerUp, this.onPointerUp);
        document.body.style.removeProperty('cursor');

        if (this.dragControl) this.dragControl.style.cursor = 'grab';

        if (this.currentDrag) {
            this.currentDrag.style.removeProperty('opacity');
            this.currentDrag.style.removeProperty('pointer-events');
            this.currentDrag = null;
        }

        this.removePlaceholder();
        this.dragControl = null;
    }

    private onPointerMove = (e: PointerEvent) => {
        if (!this.currentDrag || !this.placeholder) return;

        const contentRect = this.content.getBoundingClientRect();
        let x = e.clientX;
        let y = e.clientY;

        if (x < contentRect.left) {
            x = contentRect.left + 1;
        } else if (x > contentRect.right) {
            x = contentRect.right - 1;
        }

        if (y < contentRect.top) {
            y = contentRect.top + 1;
        } else if (y > contentRect.bottom) {
            y = contentRect.bottom - 1;
        }

        const element = document.elementFromPoint(x, y) as HTMLElement | null;
        const target = element?.closest('.block') as HTMLElement | null;
        if (!target || target === this.currentDrag || target === this.placeholder) {
            return;
        }

        const rect = target.getBoundingClientRect();
        const before = y < rect.top + rect.height / 2;
        target.parentElement!.insertBefore(this.placeholder, before ? target : target.nextSibling);
    };

    private onPointerUp = () => {
        if (!this.currentDrag || !this.placeholder) return;

        this.placeholder.parentElement!.insertBefore(this.currentDrag, this.placeholder);
        this.currentDrag.style.removeProperty('opacity');
        this.currentDrag.style.removeProperty('pointer-events');

        document.removeEventListener(EventTypes.PointerMove, this.onPointerMove);
        document.removeEventListener(EventTypes.PointerUp, this.onPointerUp);

        document.body.style.removeProperty('cursor');
        if (this.dragControl) this.dragControl.style.cursor = 'grab';

        const droppedBlock = this.currentDrag;
        this.currentDrag = null;
        this.removePlaceholder();
        this.callbacks.onDragEnd(droppedBlock);
    };

    private createPlaceholder() {
        this.placeholder = document.createElement('div');
        const ph = this.placeholder;
        ph.className = 'drag-placeholder';
        ph.style.height = '2px';
        ph.style.background = 'var(--color-primary, #0078d4)';
        ph.style.margin = '4px 0';
        ph.style.pointerEvents = 'none';
        ph.contentEditable = 'false';

        this.currentDrag!.parentElement!.insertBefore(ph, this.currentDrag!.nextSibling);
    }

    private removePlaceholder() {
        this.placeholder?.remove();
        this.placeholder = null;
    }
}