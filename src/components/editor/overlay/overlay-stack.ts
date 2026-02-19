import { dom, keyboard } from "@utils/index.ts";
import { OverlayComponent } from "./overlay-component.tsx";
import { EventTypes } from "@utils/dom";

/**
 * Manages a stack of overlays (e.g. modals, dialogs) and provides functionality
 * to close and remove them, including handling key events (e.g. Escape) and
 * mouse clicks outside the overlay to close it.
 *
 * Supports toggle behavior (reopening the same overlay closes it)
 * and overlay compatibility rules via `canOverlay()` and `canOverlayClasses`.
 */
export class OverlayStack {

    private stack: HTMLElement[] = [];

    /**
     * Registers event listeners for keydown (to close with Escape key) and click
     * (to close on outside click) events.
     */
    constructor() {
        document.addEventListener(dom.EventTypes.KeyDown, (event) => this.handleKey(event));
        document.addEventListener(dom.EventTypes.Click, (event) => this.handleClick(event));
    }

    /**
    * Adds a new overlay to the stack.
    * 
    * If an overlay of the same type is already open, it is removed and
    * the new one is not added — resulting in a toggle-like behavior.
    * 
    * Otherwise, it removes incompatible overlays (based on `canOverlay()` rules)
    * before adding the new one to the stack.
    *
    * @param element The overlay element to add.
    */
    public push(element: HTMLElement) {
        if (element instanceof OverlayComponent) {

            // Toggle behavior: close existing overlay of the same type
            for (let i = this.stack.length - 1; i >= 0; i--) {
                const current = this.stack[i];
                if (current instanceof OverlayComponent && current.constructor === element.constructor) {
                    this.stack.splice(i, 1);
                    current.remove();
                    element.remove();
                    return;
                }
            }

            this.removeIncompatibleOverlays(element);
        } else {
            this.removeIncompatibleOverlays();
        }

        // Add new overlay to the top of the stack
        this.stack.push(element);
    }

    /**
     * Returns the topmost overlay element in the stack without removing it.
     * @returns The topmost overlay element or undefined if the stack is empty.
     */
    public peek(): HTMLElement | undefined {
        return this.stack[this.stack.length - 1];
    }

    /**
     * Pops and removes the topmost overlay element from the stack.
     */
    public pop() {
        const element = this.stack.pop();

        if (element) {
            element.remove();
        }
    }

    /**
    * Removes all overlays from the stack in LIFO order.
    */
    public clear() {
        while (this.stack.length > 0) {
            const element = this.stack.pop();
            element?.remove();
        }
    }

    /**
     * Removes a specific overlay element from the stack and removes it from the DOM.
     * @param element The overlay element to remove.
     */
    public remove(element: HTMLElement) {
        const idx = this.stack.lastIndexOf(element);
        if (idx !== -1) {
            this.stack.splice(idx, 1);
            element.remove();
        }
    }

    /**
    * Handles keydown events to close the overlay when the Escape key is pressed.
    * @param event The keydown event.
    */
    private readonly handleKey = (event: KeyboardEvent) => {
        if (event.key === keyboard.KeyboardKeys.Escape) {
            this.pop();
        }
    };

    /**
     * Handles click events to remove the overlay if the click occurred outside of it.
     * @param event The mouse click event.
     */
    private readonly handleClick = (event: MouseEvent) => {
        const top = this.peek();
        if (!top) return;

        const target = event.target as Node | null;
        if (!target) return;

        const clickedInsideAnyOverlay = this.stack.some((overlay) => overlay.contains(target));
        if (clickedInsideAnyOverlay) return;

        const clickedInsideEditor = target instanceof Element
            ? Boolean(target.closest("#editorContent"))
            : false;

        if (clickedInsideEditor) {

            const selection = globalThis.getSelection?.();
            const hasExpandedSelection = Boolean(selection && selection.rangeCount > 0 && !selection.isCollapsed);
            if (event.detail > 1 || hasExpandedSelection) {
                return;
            }
            
            document.dispatchEvent(new CustomEvent(EventTypes.GutenOverlayGroupClose));
            this.clear();
            return;
        }

        const clickedInside = top.contains(target);
        if (!clickedInside && (top as OverlayComponent).canCloseOnClickOutside) {
            this.remove(top);
        }
    };

    /**
    * Removes overlays from the stack that are not allowed to coexist
    * with the incoming overlay, based on its `canOverlay()` rules.
    *
    * Called automatically when a new overlay is pushed to the stack.
    * If `incoming.canOverlay(current)` returns false, the existing overlay
    * is removed from both the stack and the DOM.
    *
    * @param incoming The new overlay being added (optional).
    */
    private removeIncompatibleOverlays(incoming?: OverlayComponent) {
        for (let i = this.stack.length - 1; i >= 0; i--) {
            const current = this.stack[i];
            const keep = incoming ? incoming.canOverlay(current) : false;
            if (keep) {
                break;
            }
            this.stack.splice(i, 1);
            current.remove();
        }
    }
}