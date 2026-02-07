/** @jsx h */

import { h } from "@core/jsx";
import { cleanupCaretAnchor } from "@utils/selection";
import { MenuUI } from "@components/ui/composites/menu";
import { DefaultProps } from "@core/components";

export interface BlockOptionsProps extends DefaultProps {

}

export class BlockOptionsMenu extends MenuUI<BlockOptionsProps> {

    override closeOnAnchorLoss: boolean = false;

    override props: BlockOptionsProps = {} as BlockOptionsProps;

    override onUnmount(): void {
        super.onUnmount();
        cleanupCaretAnchor(this.props.anchor ?? null);
    }
}