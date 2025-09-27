/** @jsx h */
import { MenuUI } from "../../../design-system/components/menu-ui.tsx";
import { MenuKeyboardController } from "../../../components/controllers/menu-keyboard-controller.ts";
import { DefaultProps } from "../../../components/types.ts";


interface BlockOptionsProps extends DefaultProps {
    keyboardNavigation?: boolean;
    anchor?: Node;
    fallbackRect?: DOMRect;
}

export class BlockOptions extends MenuUI {

    override props: BlockOptionsProps = {} as BlockOptionsProps;
    private keyboardController?: MenuKeyboardController;

    override onMount(): void {
        const { keyboardNavigation = true, anchor, fallbackRect } = this.props as BlockOptionsProps;
        if (keyboardNavigation) {
            this.keyboardController = new MenuKeyboardController(this);
            this.keyboardController.connect();
        }

        if (anchor) {
            this.positionToAnchor(anchor);
        } else if (fallbackRect) {
            this.positionWithRect(fallbackRect);
        }
    }

    override onUnmount(): void {
        this.keyboardController?.disconnect();
    }

    private positionWithRect(rect: DOMRect) {
        const gap = 8;
        this.style.top = `${rect.top}px`;
        this.style.left = `${rect.right + gap}px`;
    }
}
