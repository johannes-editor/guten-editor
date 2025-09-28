/** @jsx h */
import { MenuUI } from "../../../design-system/components/menu-ui.tsx";
import { MenuKeyboardController } from "../../../components/controllers/menu-keyboard-controller.ts";
import { DefaultProps } from "../../../components/types.ts";


export interface BlockOptionsProps extends DefaultProps {
    keyboardNavigation?: boolean;
}

export class BlockOptions extends MenuUI {

    static override styles = this.extendStyles(/*css*/`
        .guten-menu-label{
            padding: var(--space-xs) var(--space-md);
            font-size: var(--font-size-xxs);
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--color-muted);
        }

        .guten-menu-separator {
            border: none;
            border-top: 1px solid var(--color-border);
            margin: var(--space-xs) var(--space-sm);
        }
    `);

    override props: BlockOptionsProps = {} as BlockOptionsProps;
    private keyboardController?: MenuKeyboardController;
    private keyboardNavigationEnabled = false;

    override onMount(): void {
        if (this.props.keyboardNavigation !== false) {
            this.enableKeyboardNavigation();
        }
    }

    override afterRender(): void {
        super.afterRender();
        if (this.keyboardNavigationEnabled) {
            this.keyboardController?.refresh();
        }
    }

    override onUnmount(): void {
        this.disableKeyboardNavigation();
    }

    public enableKeyboardNavigation(options?: { focusFirst?: boolean }): void {
        if (this.props.keyboardNavigation === false) return;

        if (!this.keyboardController) {
            this.keyboardController = new MenuKeyboardController(this);
        }

        const focusFirst = options?.focusFirst ?? true;
        const navigationOptions: { focusSelected?: boolean; forceFirst?: boolean } = focusFirst
            ? {}
            : { focusSelected: false, forceFirst: false };

        if (!this.keyboardNavigationEnabled) {
            this.keyboardController.connect(navigationOptions);
            this.keyboardNavigationEnabled = true;
        } else {
            this.keyboardController.refresh(navigationOptions);
        }
    }

    public disableKeyboardNavigation(): void {
        if (!this.keyboardNavigationEnabled) return;
        this.keyboardController?.disconnect();
        this.keyboardNavigationEnabled = false;
    }
}
