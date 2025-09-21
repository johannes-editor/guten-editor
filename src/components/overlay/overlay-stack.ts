import { dom, keyboard } from "../../utils/index.ts";
import { OverlayOpenStrategy, OverlayStackAware, OverlayStackOptions } from "./types.ts";

interface OverlayEntry {
    element: HTMLElement;
    options: Required<OverlayStackOptions>;
}

const DEFAULT_OPTIONS: Required<OverlayStackOptions> = {
    allowOverlayOnTop: false,
    openStrategy: OverlayOpenStrategy.CloseDisallowed,
};

function isOverlayStackAware(element: HTMLElement): element is HTMLElement & OverlayStackAware {
    return typeof (element as OverlayStackAware).getOverlayStackOptions === "function";
}

/**
 * Manages a stack of overlays (e.g. modals, dialogs) and provides functionality
 * to close and remove them, including handling key events (e.g. Escape) and
 * mouse clicks outside the overlay to close it.
 */
export class OverlayStack {

    private stack: OverlayEntry[] = [];

    /**
     * Registers event listeners for keydown (to close with Escape key) and click
     * (to close on outside click) events.
     */
    constructor() {
        document.addEventListener(dom.EventTypes.KeyDown, (event) => this.handleKey(event));
        document.addEventListener(dom.EventTypes.Click, (event) => this.handleClick(event));
    }

    /**
     * Pushes a new overlay element onto the stack.
     * @param element The overlay element to add to the stack.
     */
    public push(element: HTMLElement) {
        const entry: OverlayEntry = {
            element,
            options: this.resolveOptions(element),
        };

        this.prepareStackFor(entry.options.openStrategy);

        this.stack.push(entry);
    }

    /**
     * Returns the topmost overlay element in the stack without removing it.
     * @returns The topmost overlay element or undefined if the stack is empty.
     */
    public peek(): HTMLElement | undefined {
        return this.peekEntry()?.element;
    }

    /**
     * Pops and removes the topmost overlay element from the stack.
     */
    public pop() {
        const entry = this.stack.pop();

        if (entry) {
            entry.element.remove();
        }
    }

    /**
     * Removes a specific overlay element from the stack and removes it from the DOM.
     * @param element The overlay element to remove.
     */
    public remove(element: HTMLElement) {
        const idx = this.stack.map((entry) => entry.element).lastIndexOf(element);
        if (idx !== -1) {
            const [entry] = this.stack.splice(idx, 1);
            entry.element.remove();
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

        const clickedInside = top.contains(event.target as Node);
        if (!clickedInside && this.canCloseOnOutside(top)) {
            this.remove(top);
        }
    };

    private canCloseOnOutside(element: HTMLElement): boolean {
        const overlay = element as OverlayStackAware;

        if (typeof overlay.canCloseOnClickOutside2 === "boolean") {
            return overlay.canCloseOnClickOutside2;
        }

        if (typeof overlay.closeOnClickOutside === "boolean") {
            return overlay.closeOnClickOutside;
        }

        return false;
    }

    private resolveOptions(element: HTMLElement): Required<OverlayStackOptions> {
        if (isOverlayStackAware(element)) {
            const options = element.getOverlayStackOptions?.();
            if (options) {
                return { ...DEFAULT_OPTIONS, ...options };
            }
        }

        return DEFAULT_OPTIONS;
    }

    private peekEntry(): OverlayEntry | undefined {
        return this.stack[this.stack.length - 1];
    }

    private prepareStackFor(strategy: OverlayOpenStrategy) {
        if (strategy === OverlayOpenStrategy.ClearStack) {
            this.clear();
            return;
        }

        if (strategy === OverlayOpenStrategy.KeepStack) {
            return;
        }

        // OverlayOpenStrategy.CloseDisallowed (default)
        while (this.stack.length > 0) {
            const topEntry = this.peekEntry();
            if (!topEntry) return;

            if (topEntry.options.allowOverlayOnTop) {
                return;
            }

            this.pop();
        }
    }

    private clear() {
        while (this.stack.length > 0) {
            this.pop();
        }
    }
}
