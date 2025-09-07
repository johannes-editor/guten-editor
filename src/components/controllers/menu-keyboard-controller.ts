import { dom, keyboard } from "../../utils/index.ts";

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
    connect(): void {
        this.items = Array.from(this.host.querySelectorAll("button"));
        if (this.items.length > 0) {
            this.items[0].classList.add("selected");
            this.items[0].focus();
        }
        document.addEventListener(dom.EventTypes.KeyDown, this.handleKey);
    }

    /** Stop listening for keyboard events. */
    disconnect(): void {
        document.removeEventListener(dom.EventTypes.KeyDown, this.handleKey);
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