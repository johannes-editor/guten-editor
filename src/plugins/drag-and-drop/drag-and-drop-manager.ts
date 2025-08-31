import { EventTypes } from "../../utils/dom/events.ts";

export class DragAndDropManager {
    private mutationObserver: MutationObserver | null = null;
    private currentDrag: HTMLElement | null = null;
    private currentTarget: HTMLElement | null = null;
    private handle: HTMLElement | null = null;
    private hideTimer: number | null = null;
    private placeholder: HTMLElement | null = null;

    constructor(private content: HTMLElement, private overlay: HTMLElement) { }

    start() {
        this.setupOverlayArea();
        this.createHandle();
        this.updateTargets();
        this.mutationObserver = new MutationObserver(() => this.updateTargets());
        this.mutationObserver.observe(this.content, { childList: true, subtree: true });
        window.addEventListener(EventTypes.Scroll, () => this.updateHandlePosition());
        window.addEventListener(EventTypes.Resize, () => this.updateHandlePosition());
        this.handle?.addEventListener(EventTypes.PointerDown, (e) => this.onPointerDown(e as PointerEvent));
        this.handle?.addEventListener(EventTypes.MouseEnter, this.onHandleEnter);
        this.handle?.addEventListener(EventTypes.MouseLeave, this.onHandleLeave);
        this.handle?.addEventListener(EventTypes.ContextMenu, this.onHandleContextMenu);
    }

    stop() {
        this.mutationObserver?.disconnect();
        this.mutationObserver = null;
        document.removeEventListener(EventTypes.PointerMove, this.onPointerMove);
        document.removeEventListener(EventTypes.PointerUp, this.onPointerUp);
        this.handle?.removeEventListener(EventTypes.PointerDown, this.onPointerDown);
        this.handle?.removeEventListener(EventTypes.MouseEnter, this.onHandleEnter);
        this.handle?.removeEventListener(EventTypes.MouseLeave, this.onHandleLeave);
        this.handle?.removeEventListener(EventTypes.ContextMenu, this.onHandleContextMenu);
        this.handle?.remove();
    }

    private setupOverlayArea() {
        const container = this.overlay.parentElement as HTMLElement;
        if (container) {
            container.style.position = "relative";
        }
        const style = this.overlay.style;
        style.position = "absolute";
        style.top = "0";
        style.left = "0";
        style.right = "0";
        style.bottom = "0";
        style.pointerEvents = "none";
        style.overflow = "visible";
    }

    private createHandle() {
        this.handle = document.createElement('div');
        const handle = this.handle;
        handle.className = 'drag-handle';
        handle.textContent = '⋮⋮';
        handle.style.position = 'absolute';
        handle.style.width = '16px';
        handle.style.height = '16px';
        handle.style.display = 'none';
        handle.style.alignItems = 'center';
        handle.style.justifyContent = 'center';
        handle.style.fontSize = '12px';
        handle.style.background = '#eee';
        handle.style.border = '1px solid #ccc';
        handle.style.borderRadius = '4px';
        handle.style.cursor = 'grab';
        handle.style.pointerEvents = 'auto';
        handle.title = 'Drag to move. Right-click for options.';
        this.overlay.appendChild(handle);
    }

    private updateTargets() {
        const blocks = Array.from(this.content.querySelectorAll('.block')) as HTMLElement[];
        for (const block of blocks) {
            this.attachListeners(block);
        }
    }

    private attachListeners(el: HTMLElement) {
        el.addEventListener(EventTypes.MouseEnter, this.onMouseEnter);
        el.addEventListener(EventTypes.MouseLeave, this.onMouseLeave);
    }

    private onMouseEnter = (e: MouseEvent) => {
        this.clearHideTimer();
        this.currentTarget = e.currentTarget as HTMLElement;
        this.showHandle();
    };

    private onMouseLeave = () => {
        if (this.currentDrag) return;
        this.startHideTimer();
    };

    private onHandleEnter = () => {
        this.clearHideTimer();
    };

    private onHandleLeave = () => {
        if (this.currentDrag) return;
        this.startHideTimer();
    };

    private onHandleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        if (!this.currentTarget || !this.handle) return;
        const event = new CustomEvent('block-contextmenu', {
            detail: { block: this.currentTarget },
            bubbles: true,
        });
        this.handle.dispatchEvent(event);
    };

    private startHideTimer() {
        this.clearHideTimer();
        this.hideTimer = window.setTimeout(() => this.hideHandle(), 200);
    }

    private clearHideTimer() {
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
    }

    private showHandle() {
        if (!this.currentTarget || !this.handle) return;
        this.handle.style.display = 'flex';
        this.updateHandlePosition();
    }

    private hideHandle() {
        if (!this.handle) return;
        this.handle.style.display = 'none';
        this.currentTarget = null;
    }

    private updateHandlePosition() {
        if (!this.currentTarget || !this.handle) return;
        const contentRect = this.content.getBoundingClientRect();
        const rect = this.currentTarget.getBoundingClientRect();
        const top = rect.top - contentRect.top;
        const left = rect.left - contentRect.left - this.handle.offsetWidth - 8;
        this.handle.style.top = `${top}px`;
        this.handle.style.left = `${left}px`;
    }

    private onPointerDown = (e: PointerEvent) => {
        if (!this.currentTarget) return;
        e.preventDefault();
        this.currentDrag = this.currentTarget;
        this.createPlaceholder();
        this.hideHandle();
        this.currentDrag.style.opacity = '0.5';
        this.currentDrag.style.pointerEvents = 'none';
        document.addEventListener(EventTypes.PointerMove, this.onPointerMove);
        document.addEventListener(EventTypes.PointerUp, this.onPointerUp);
    };

    private onPointerMove = (e: PointerEvent) => {
        if (!this.currentDrag || !this.placeholder) return;

        const contentRect = this.content.getBoundingClientRect();
        let x = e.clientX;
        if (x < contentRect.left) {
            x = contentRect.left + 1;
        } else if (x > contentRect.right) {
            x = contentRect.right - 1;
        }

        const element = document.elementFromPoint(x, e.clientY) as HTMLElement | null;
        const target = element?.closest('.block') as HTMLElement | null;
        if (!target || target === this.currentDrag || target === this.placeholder) {
            return;
        }
        const rect = target.getBoundingClientRect();
        const before = e.clientY < rect.top + rect.height / 2;
        target.parentElement!.insertBefore(this.placeholder, before ? target : target.nextSibling);
    };

    private onPointerUp = () => {
        if (!this.currentDrag || !this.placeholder) return;
        this.placeholder.parentElement!.insertBefore(this.currentDrag, this.placeholder);
        this.currentDrag.style.removeProperty('opacity');
        this.currentDrag.style.removeProperty('pointer-events');
        this.removePlaceholder();
        this.updateTargets();
        this.currentTarget = this.currentDrag;
        this.currentDrag = null;
        document.removeEventListener(EventTypes.PointerMove, this.onPointerMove);
        document.removeEventListener(EventTypes.PointerUp, this.onPointerUp);
        this.showHandle();
    };

    private createPlaceholder() {
        this.placeholder = document.createElement('div');
        const ph = this.placeholder;
        ph.className = 'drag-placeholder';
        ph.style.height = '2px';
        ph.style.background = '#0078d4';
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

