import { EventTypes } from "../../utils/dom/events.ts";
import { h, runCommand } from "../index.ts";
import { Tooltip } from "../../design-system/components/tooltip.tsx";

export class DragAndDropManager {
    private mutationObserver: MutationObserver | null = null;
    private currentDrag: HTMLElement | null = null;
    private currentTarget: HTMLElement | null = null;
    private handleWrap: HTMLElement | null = null;
    private handle: HTMLElement | null = null;
    private hideTimer: number | null = null;
    private placeholder: HTMLElement | null = null;
    private layer: HTMLElement | null = null;

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
        this.handleWrap?.addEventListener(EventTypes.MouseEnter, this.onHandleEnter);
        this.handleWrap?.addEventListener(EventTypes.MouseLeave, this.onHandleLeave);
        this.handle?.addEventListener(EventTypes.ContextMenu, this.onHandleContextMenu);
    }

    stop() {
        this.mutationObserver?.disconnect();
        this.mutationObserver = null;
        document.removeEventListener(EventTypes.PointerMove, this.onPointerMove);
        document.removeEventListener(EventTypes.PointerUp, this.onPointerUp);
        this.handle?.removeEventListener(EventTypes.PointerDown, this.onPointerDown);
        this.handleWrap?.removeEventListener(EventTypes.MouseEnter, this.onHandleEnter);
        this.handleWrap?.removeEventListener(EventTypes.MouseLeave, this.onHandleLeave);
        this.handle?.removeEventListener(EventTypes.ContextMenu, this.onHandleContextMenu);
        this.handleWrap?.remove();
        this.handleWrap = null;
        this.handle = null;
        this.layer?.remove();
        this.layer = null;
    }

    private setupOverlayArea() {
        this.layer = document.createElement('div');
        const layer = this.layer;
        layer.style.position = 'fixed';
        layer.style.top = '0';
        layer.style.left = '0';
        layer.style.pointerEvents = 'none';
        layer.style.overflow = 'visible';
        this.overlay.appendChild(layer);
    }

    private createHandle() {
        const handle = document.createElement('div');
        handle.className = 'drag-handle';
        handle.textContent = '⠿';
        handle.style.width = '1.1rem';
        handle.style.height = '1.1rem';
        handle.style.display = 'flex';
        handle.style.alignItems = 'center';
        handle.style.justifyContent = 'center';
        handle.style.fontSize = '1.1rem';
        handle.style.cursor = 'grab';
        handle.style.opacity = '0.45';

        const wrap = h(
            Tooltip,
            { text: 'Drag to move block \n Right click to open menu', shortcut: 'Mod+Shift+O', placement: 'right' },
            handle,
        ) as HTMLElement;
        wrap.style.position = 'absolute';
        wrap.style.display = 'none';
        wrap.style.pointerEvents = 'auto';

        this.layer?.appendChild(wrap);
        this.handle = handle;
        this.handleWrap = wrap;
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
        if (!this.currentTarget || !this.handleWrap) return;
        const block = this.currentTarget;
        const anchor = this.handleWrap;
        const rect = anchor.getBoundingClientRect();
        runCommand('openBlockOptions', { content: { block, anchor, rect } });
        this.hideHandle();
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
        if (!this.currentTarget || !this.handleWrap) return;
        this.handleWrap.style.display = 'block';
        this.updateHandlePosition();
    }

    private hideHandle() {
        if (!this.handleWrap) return;
        this.handleWrap.style.display = 'none';
        this.currentTarget = null;
    }

    private updateHandlePosition() {
        if (!this.currentTarget || !this.handle || !this.handleWrap) return;
        const textRect = this.getFirstLineRect(this.currentTarget);
        const blockRect = this.currentTarget.getBoundingClientRect();
        const rect = textRect ?? blockRect;
        const top = rect.top + rect.height / 2 - this.handle.offsetHeight / 2;
        const left = blockRect.left - this.handle.offsetWidth - 8;
        this.handleWrap.style.top = `${top}px`;
        this.handleWrap.style.left = `${left}px`;
    }

    private getFirstLineRect(el: HTMLElement): DOMRect | null {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        const node = walker.nextNode();
        if (!node || !node.textContent) return null;
        const range = document.createRange();
        range.setStart(node, 0);
        range.setEnd(node, Math.min(1, node.textContent.length));
        const rect = range.getBoundingClientRect();
        range.detach?.();
        return rect.height ? rect : null;
    }

    private onPointerDown = (e: PointerEvent) => {
        if (e.button !== 0 || !this.currentTarget) return;
        e.preventDefault();
        this.currentDrag = this.currentTarget;
        this.createPlaceholder();
        this.hideHandle();
        this.currentDrag.style.opacity = '0.5';
        this.currentDrag.style.pointerEvents = 'none';
        if (this.handle) this.handle.style.cursor = 'grabbing';
        document.body.style.cursor = 'grabbing';
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
        document.body.style.removeProperty('cursor');
        if (this.handle) this.handle.style.cursor = 'grab';
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