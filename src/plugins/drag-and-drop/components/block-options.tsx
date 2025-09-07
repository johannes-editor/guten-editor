/** @jsx h */
import { MenuUI } from "../../../design-system/components/menu-ui.tsx";
import { MenuKeyboardController } from "../../../components/controllers/menu-keyboard-controller.ts";
import { DefaultProps } from "../../../components/types.ts";


interface BlockOptionsProps extends DefaultProps {
    keyboardNavigation?: boolean;
}

export class BlockOptions extends MenuUI {

    override props: BlockOptionsProps = {} as BlockOptionsProps;
    private keyboardController?: MenuKeyboardController;

    override onMount(): void {
        const { keyboardNavigation = true } = this.props as BlockOptionsProps;
        if (keyboardNavigation) {
            this.keyboardController = new MenuKeyboardController(this);
            this.keyboardController.connect();
        }
    }

    override onUnmount(): void {
        this.keyboardController?.disconnect();
    }
}