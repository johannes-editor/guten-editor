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

    override onMount(): void {
        const { keyboardNavigation = true } = this.props;
        if (keyboardNavigation) {
            this.keyboardController = new MenuKeyboardController(this);
            this.keyboardController.connect();
        }
    }

    override onUnmount(): void {
        this.keyboardController?.disconnect();
    }
}