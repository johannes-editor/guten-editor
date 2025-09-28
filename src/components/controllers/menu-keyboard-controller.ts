import { dom, keyboard } from "../../utils/index.ts";

interface RefreshOptions {
    focusSelected?: boolean;
    forceFirst?: boolean;
}

/**
 * Controller to add keyboard navigation (ArrowUp/ArrowDown/Enter)
 * to menu-like components. Attach to any element that contains
 * focusable items (e.g., buttons) inside.
 */
export class MenuKeyboardController {
    private host: HTMLElement;
    private items: HTMLElement[] = [];
    private selectedIndex = 0;

    constructor(host: HTMLElement) {
        this.host = host;
    }

    /** Start listening for keyboard events and setup initial focus. */
    connect(options: RefreshOptions = {}): void {
        this.refresh({
            focusSelected: options.focusSelected ?? true,
            forceFirst: options.forceFirst ?? true,
        });
        document.addEventListener(dom.EventTypes.KeyDown, this.handleKey);
    }

    /** Stop listening for keyboard events. */
    disconnect(): void {
        document.removeEventListener(dom.EventTypes.KeyDown, this.handleKey);
        this.items = [];
    }

    refresh(options: RefreshOptions = {}): void {
        const focusSelected = options.focusSelected ?? false;
        const forceFirst = options.forceFirst ?? false;

        const previousSelected = (!forceFirst && this.items.length > 0)
            ? this.items[this.selectedIndex]
            : null;
        const activeElement = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;

        this.items = Array.from(this.host.querySelectorAll("button"));
        if (!this.items.length) {
            this.selectedIndex = 0;
            return;
        }

        let nextIndex = forceFirst ? 0 : Math.min(this.selectedIndex, this.items.length - 1);

        if (!forceFirst) {
            if (previousSelected) {
                const previousIndex = this.items.indexOf(previousSelected);
                if (previousIndex >= 0) {
                    nextIndex = previousIndex;
                }
            }

            if (activeElement) {
                const activeIndex = this.items.indexOf(activeElement);
                if (activeIndex >= 0) {
                    nextIndex = activeIndex;
                }
            }

            if (nextIndex < 0 || Number.isNaN(nextIndex)) {
                nextIndex = 0;
            }
        }

        this.items.forEach((item) => item.classList.remove("selected"));

        const target = this.items[Math.min(nextIndex, this.items.length - 1)];
        if (target) {
            target.classList.add("selected");
            if (focusSelected || forceFirst) {
                target.focus();
            }
            this.selectedIndex = this.items.indexOf(target);
        } else {
            this.selectedIndex = 0;
        }
    }

    private handleKey = (event: KeyboardEvent) => {
        if (!this.items.length) return;

        switch (event.key) {
            case keyboard.KeyboardKeys.ArrowDown:
                event.preventDefault();
                this.move(1);
                break;
            case keyboard.KeyboardKeys.ArrowUp:
                event.preventDefault();
                this.move(-1);
                break;
            case keyboard.KeyboardKeys.ArrowRight: {
                const item = this.items[this.selectedIndex];
                if (!item) return;
                if (item.dataset.hasOverlay === "true") {
                    event.preventDefault();
                    item.dispatchEvent(new MouseEvent(dom.EventTypes.MouseDown, { bubbles: true }));
                }
                break;
            }
            case keyboard.KeyboardKeys.Enter:
                event.preventDefault();
                const item = this.items[this.selectedIndex];
                item?.dispatchEvent(new MouseEvent(dom.EventTypes.MouseDown, { bubbles: true }));
                break;
        }
    };

    private move(delta: number) {
        const nextIndex = (this.selectedIndex + delta + this.items.length) % this.items.length;
        this.updateSelection(nextIndex);
    }

    private updateSelection(index: number) {
        const prev = this.items[this.selectedIndex];
        prev?.classList.remove("selected");
        const next = this.items[index];
        next?.classList.add("selected");
        next?.focus();
        this.selectedIndex = index;
    }
}