import { runCommand } from "@core/command";
import { EventTypes } from "@utils/dom/events.ts";
import { ParagraphBlock } from "@components/blocks/paragraph.tsx";
import { focusOnElementAtStart } from "@utils/dom";
import { BlockControls } from "./components/block-controls.tsx";

import { DragSessionController } from "./controllers/drag-session-controller.ts";
import { BlockControlsPositioner } from "./controllers/block-controls-positioner.ts";

export class DragManager {

    private mutationObserver: MutationObserver | null = null;
    private overlayObserver: MutationObserver | null = null;
    private currentDrag: HTMLElement | null = null;
    private currentTarget: HTMLElement | null = null;
    private controlsHost: HTMLElement | null = null;
    private controlsWrap: HTMLElement | null = null;
    private dragControl: HTMLButtonElement | null = null;
    private addControl: HTMLButtonElement | null = null;
    private hideTimer: number | null = null;
    // private placeholder: HTMLElement | null = null;
    private layer: HTMLElement | null = null;

    // constructor(private content: HTMLElement, private overlay: HTMLElement) { }



    private dragSession: DragSessionController;
    private positioner = new BlockControlsPositioner();

    constructor(private content: HTMLElement, private overlay: HTMLElement) {
        this.dragSession = new DragSessionController(this.content, {
            onDragStart: () => {
                this.hideHandle();
            },
            onDragEnd: (draggedBlock) => {
                this.updateTargets();
                this.currentTarget = draggedBlock;
                this.showHandle();
            },
        });
    }

    start() {
        this.setupOverlayArea();
        this.createHandle();
        this.bindHandleEvents();
        this.observeOverlay();
        this.updateTargets();

        this.mutationObserver = new MutationObserver(() => this.updateTargets());
        this.mutationObserver.observe(this.content, { childList: true, subtree: true });

        globalThis.addEventListener(EventTypes.Scroll, this.onViewportChange);
        globalThis.addEventListener(EventTypes.Resize, this.onViewportChange);
    }

    stop() {
        this.mutationObserver?.disconnect();
        this.mutationObserver = null;
        this.overlayObserver?.disconnect();
        this.overlayObserver = null;

        this.dragSession.dispose();

        globalThis.removeEventListener(EventTypes.Scroll, this.onViewportChange);
        globalThis.removeEventListener(EventTypes.Resize, this.onViewportChange);

        this.unbindHandleEvents();
        this.controlsHost?.remove();
        this.controlsHost = null;
        this.controlsWrap?.remove();
        this.controlsWrap = null;
        this.dragControl = null;
        this.addControl = null;
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

        const controlsHost = <BlockControls />;

        this.layer?.appendChild(controlsHost);
        this.controlsHost = controlsHost;
        const controlsWrap = controlsHost.querySelector('.block-controls') as HTMLElement | null;
        if (!controlsWrap) return;

        this.layer?.appendChild(controlsWrap);
        this.controlsWrap = controlsWrap;
        this.addControl = controlsWrap.querySelector('button[data-control-type="add"]');
        this.dragControl = controlsWrap.querySelector('button[data-control-type="drag"]');
    }

    private bindHandleEvents() {
        this.dragControl?.addEventListener(EventTypes.PointerDown, this.onPointerDown);
        this.controlsWrap?.addEventListener(EventTypes.MouseEnter, this.onHandleEnter);
        this.controlsWrap?.addEventListener(EventTypes.MouseLeave, this.onHandleLeave);
        this.dragControl?.addEventListener(EventTypes.ContextMenu, this.onHandleContextMenu);
        this.addControl?.addEventListener(EventTypes.Click, this.onAddClick);
    }

    private unbindHandleEvents() {
        this.dragControl?.removeEventListener(EventTypes.PointerDown, this.onPointerDown);
        this.controlsWrap?.removeEventListener(EventTypes.MouseEnter, this.onHandleEnter);
        this.controlsWrap?.removeEventListener(EventTypes.MouseLeave, this.onHandleLeave);
        this.dragControl?.removeEventListener(EventTypes.ContextMenu, this.onHandleContextMenu);
        this.addControl?.removeEventListener(EventTypes.Click, this.onAddClick);
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
        const handleMissing = !this.controlsWrap || !this.controlsWrap.isConnected || !this.dragControl || !this.dragControl.isConnected || !this.addControl || !this.addControl.isConnected;
        this.observeOverlay();

        if (layerMissing) {
            this.controlsHost?.remove();
            this.controlsHost = null;
            this.controlsWrap?.remove();
            this.dragControl = null;
            this.controlsWrap = null;
            this.addControl = null;
            this.setupOverlayArea();
            this.createHandle();
            this.bindHandleEvents();
            return;
        }

        if (handleMissing) {
            this.controlsHost?.remove();
            this.controlsHost = null;
            this.controlsWrap?.remove();
            this.dragControl = null;
            this.controlsWrap = null;
            this.addControl = null;
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
        if (this.dragSession.isDragging()) return;
        this.clearHideTimer();
        this.hideTimer = globalThis.setTimeout(() => this.hideHandle(), 200);
    }

    private onHandleEnter = () => {
        this.clearHideTimer();
    };

    private onHandleLeave = () => {
        if (this.dragSession.isDragging()) return;
        this.startHideTimer();
    };

    private onHandleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        if (!this.currentTarget || !this.controlsWrap) return;
        const rect = this.controlsWrap.getBoundingClientRect();
        const block = this.currentTarget;
        // this.hideHandle();
        runCommand('openBlockOptions', { content: { block, rect } });
    };

    private onAddClick = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!this.currentTarget) return;

        const anchorBlock = this.currentTarget;
        const paragraph = <ParagraphBlock />;
        const parent = anchorBlock.parentElement;
        if (!parent) return;

        if (e.altKey) {
            parent.insertBefore(paragraph, anchorBlock);
        } else {
            parent.insertBefore(paragraph, anchorBlock.nextSibling);
        }

        focusOnElementAtStart(paragraph);
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
        this.positioner.updatePosition(this.currentTarget, this.dragControl, this.controlsWrap);
    }

    private onViewportChange = () => {
        this.updateHandlePosition();
    };

    private onPointerDown = (e: PointerEvent) => {
        if (e.button !== 0 || !this.currentTarget) return;

        e.preventDefault();
        this.dragSession.startDrag(this.currentTarget, this.dragControl);
    };
}