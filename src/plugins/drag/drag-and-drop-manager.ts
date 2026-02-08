
import { h } from "@core/jsx";
import { runCommand } from "@core/command";
import { Tooltip } from "@components/ui/primitives/tooltip";
import { EventTypes } from "@utils/dom/events.ts";
import { ParagraphBlock } from "@components/blocks/paragraph.tsx";
import { focusOnElement } from "@utils/dom";
import { GripVerticalIcon, PlusIcon } from "@components/ui/icons";

export class DragAndDropManager {
    private mutationObserver: MutationObserver | null = null;
    private overlayObserver: MutationObserver | null = null;
    private currentDrag: HTMLElement | null = null;
    private currentTarget: HTMLElement | null = null;
    private handleWrap: HTMLElement | null = null;
    private controlsWrap: HTMLElement | null = null;
    private handle: HTMLElement | null = null;
    private addButton: HTMLElement | null = null;
    private hideTimer: number | null = null;
    private placeholder: HTMLElement | null = null;
    private layer: HTMLElement | null = null;

    constructor(private content: HTMLElement, private overlay: HTMLElement) { }

    start() {
        this.setupOverlayArea();
        this.createHandle();
        this.bindHandleEvents();
        this.observeOverlay();
        this.updateTargets();

        this.mutationObserver = new MutationObserver(() => this.updateTargets());
        this.mutationObserver.observe(this.content, { childList: true, subtree: true });

        globalThis.addEventListener(EventTypes.Scroll, () => this.updateHandlePosition());
        globalThis.addEventListener(EventTypes.Resize, () => this.updateHandlePosition());
    }

    stop() {
        this.mutationObserver?.disconnect();
        this.mutationObserver = null;
        this.overlayObserver?.disconnect();
        this.overlayObserver = null;

        document.removeEventListener(EventTypes.PointerMove, this.onPointerMove);
        document.removeEventListener(EventTypes.PointerUp, this.onPointerUp);

        this.unbindHandleEvents();
        this.controlsWrap?.remove();
        this.controlsWrap = null;
        this.handle = null;
        this.addButton = null;
        this.layer?.remove();
        this.layer = null;
    }

    private setupOverlayArea() {

        const overlayRoot = this.resolveOverlayRoot();
        if (!overlayRoot) return;

        this.layer = document.createElement('div');
        const layer = this.layer;
        layer.style.position = 'fixed';
        layer.style.top = '0';
        layer.style.left = '0';
        layer.style.pointerEvents = 'none';
        layer.style.overflow = 'visible';
        overlayRoot.appendChild(layer);
    }

    private createHandle() {

        if (!this.layer || !this.layer.isConnected) return;

        const controlsWrap = document.createElement('div');
        controlsWrap.style.position = 'absolute';
        controlsWrap.style.display = 'none';
        controlsWrap.style.pointerEvents = 'auto';
        controlsWrap.style.alignItems = 'center';
        controlsWrap.style.gap = '6px';

        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.setAttribute('aria-label', 'Add paragraph below (Alt+Click to add above)');
        addButton.style.display = 'flex';
        addButton.style.alignItems = 'center';
        addButton.style.justifyContent = 'center';
        addButton.style.cursor = 'pointer';
        addButton.style.opacity = '0.35';
        addButton.style.border = '0';
        addButton.style.padding = '0';
        addButton.style.background = 'transparent';
        addButton.style.lineHeight = '1';
        addButton.style.color = 'var(--color-ui-text)';

        const addIcon = h(PlusIcon, { size: '1.125rem', 'aria-hidden': 'true' }) as HTMLElement;
        addButton.append(addIcon);

        const addWrap = h(
            Tooltip,
            { text: 'Add paragraph below\nAlt+Click to add above', shortcut: '', placement: 'right' },
            addButton,
        ) as HTMLElement;

        const handle = document.createElement('div');
        handle.className = 'drag-handle';
        handle.style.display = 'flex';
        handle.style.alignItems = 'center';
        handle.style.justifyContent = 'center';
        handle.style.cursor = 'grab';
        handle.style.opacity = '0.35';
        handle.style.color = 'var(--color-ui-text)';

        const handleIcon = h(GripVerticalIcon, { size: '1.125rem' }) as HTMLElement;
        handle.append(handleIcon);

        const handleWrap = h(
            Tooltip,
            { text: 'Drag to move block \n Right click to open menu', shortcut: '', placement: 'right' },
            handle,
        ) as HTMLElement;

        controlsWrap.append(addWrap, handleWrap);

        this.layer?.appendChild(controlsWrap);
        this.handle = handle;
        this.controlsWrap = controlsWrap;
        this.addButton = addButton;
    }

    private bindHandleEvents() {
        this.handle?.addEventListener(EventTypes.PointerDown, this.onPointerDown);
        this.controlsWrap?.addEventListener(EventTypes.MouseEnter, this.onHandleEnter);
        this.controlsWrap?.addEventListener(EventTypes.MouseLeave, this.onHandleLeave);
        this.handle?.addEventListener(EventTypes.ContextMenu, this.onHandleContextMenu);
        this.addButton?.addEventListener(EventTypes.Click, this.onAddClick);
    }

    private unbindHandleEvents() {
        this.handle?.removeEventListener(EventTypes.PointerDown, this.onPointerDown);
        this.controlsWrap?.removeEventListener(EventTypes.MouseEnter, this.onHandleEnter);
        this.controlsWrap?.removeEventListener(EventTypes.MouseLeave, this.onHandleLeave);
        this.handle?.removeEventListener(EventTypes.ContextMenu, this.onHandleContextMenu);
        this.addButton?.removeEventListener(EventTypes.Click, this.onAddClick);
    }

    private observeOverlay() {
        this.overlayObserver?.disconnect();
        const overlayRoot = this.resolveOverlayRoot();
        if (!overlayRoot) return;

        this.overlayObserver = new MutationObserver(() => this.ensureOverlayIntegrity());
        this.overlayObserver.observe(overlayRoot, { childList: true, subtree: false });
    }

    private resolveOverlayRoot(): HTMLElement | null {
        if (this.overlay?.isConnected) return this.overlay;

        if (this.overlay?.id) {
            const next = document.getElementById(this.overlay.id);
            if (next) {
                this.overlay = next;
                return next;
            }
        }

        const fallback = document.getElementById('overlayArea');
        if (fallback) {
            this.overlay = fallback;
            return fallback;
        }

        return null;
    }

    private ensureOverlayIntegrity() {
        const overlayRoot = this.resolveOverlayRoot();
        if (!overlayRoot) return;

        const layerMissing = !this.layer || !this.layer.isConnected || !overlayRoot.contains(this.layer);
        const handleMissing = !this.controlsWrap || !this.controlsWrap.isConnected || !this.handle || !this.handle.isConnected || !this.addButton || !this.addButton.isConnected;
        this.observeOverlay();

        if (layerMissing) {
            this.layer?.remove();
            this.controlsWrap?.remove();
            this.handle = null;
            this.controlsWrap = null;
            this.addButton = null;
            this.setupOverlayArea();
            this.createHandle();
            this.bindHandleEvents();
            return;
        }

        if (handleMissing) {
            this.controlsWrap?.remove();
            this.handle = null;
            this.controlsWrap = null;
            this.addButton = null;
            this.createHandle();
            this.bindHandleEvents();
        }
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
        if (!this.currentTarget || !this.controlsWrap) return;
        const rect = this.controlsWrap.getBoundingClientRect();
        const block = this.currentTarget;
        this.hideHandle();
        runCommand('openBlockOptions', { content: { block, rect } });
    };

    private onAddClick = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!this.currentTarget) return;

        const anchorBlock = this.currentTarget;
        const paragraph = h(ParagraphBlock, {}) as HTMLElement;
        const parent = anchorBlock.parentElement;
        if (!parent) return;

        if (e.altKey) {
            parent.insertBefore(paragraph, anchorBlock);
        } else {
            parent.insertBefore(paragraph, anchorBlock.nextSibling);
        }

        focusOnElement(paragraph);
        paragraph.dispatchEvent(new Event(EventTypes.Input, { bubbles: true }));
        this.currentTarget = paragraph;
        this.updateTargets();
        this.showHandle();
    };

    private startHideTimer() {
        this.clearHideTimer();
        this.hideTimer = globalThis.setTimeout(() => this.hideHandle(), 200);
    }

    private clearHideTimer() {
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
    }

    private showHandle() {
        this.ensureOverlayIntegrity();
        if (!this.currentTarget || !this.controlsWrap) return;
        this.controlsWrap.style.display = 'flex';
        this.updateHandlePosition();
    }

    private hideHandle() {
        if (!this.controlsWrap) return;
        this.controlsWrap.style.display = 'none';
        this.currentTarget = null;
    }

    private updateHandlePosition() {
        if (!this.currentTarget || !this.handle || !this.controlsWrap) return;
        const textRect = this.getFirstLineRect(this.currentTarget);
        const blockRect = this.currentTarget.getBoundingClientRect();
        const rect = textRect ?? blockRect;
        const top = rect.top + rect.height / 2 - this.handle.offsetHeight / 2;
        const controlsWidth = this.controlsWrap.offsetWidth;
        const left = blockRect.left - controlsWidth - 8;
        this.controlsWrap.style.top = `${top}px`;
        this.controlsWrap.style.left = `${left}px`;
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