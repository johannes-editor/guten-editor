/** @jsx h */
import { h } from "../../jsx.ts";
import { MenuUI, type MenuUIProps, type MenuUIState } from "./menu-ui.tsx";

export class NavigationMenu<P extends MenuUIProps = MenuUIProps, S extends MenuUIState = MenuUIState> extends MenuUI<P, S> {

    private parentMenu: NavigationMenu | null = null;
    private didInitialFocus = false;


    override onMount(): void {
        super.onMount();
        this.parentMenu = this.getParentMenu();
        this.focusFirstItem();
    }

    override afterRender(): void {
        super.afterRender();
        this.focusFirstItem();
    }

    override onKeyDown(e: KeyboardEvent) {
        if (e.key === "Escape" && this.parentMenu) {
            e.preventDefault();
            e.stopPropagation();
            this.props.anchor?.focus?.();
            this.remove();
            return;
        }

        super.onKeyDown(e);
    }

    private focusFirstItem() {
        if (this.didInitialFocus) return;
        const buttons = this.querySelectorAll<HTMLButtonElement>("button");
        const first = buttons[0];
        if (!first) return;
        this.didInitialFocus = true;
        requestAnimationFrame(() => {
            try {
                first.focus({ preventScroll: true });
            } catch {
                first.focus();
            }
        });
    }

    private getParentMenu(): NavigationMenu | null {
        const anchor = this.props.anchor;
        if (!anchor) return null;
        const parent = MenuUI.findParentByTrigger(anchor);
        if (!parent) return null;
        return parent as unknown as NavigationMenu;
    }
}