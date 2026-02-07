/** @jsx h */

import { h } from "@core/jsx/index.ts";
import { cleanupCaretAnchor } from "@utils/selection/index.ts";
import { MenuUI } from "@components/ui/composites/menu/menu-ui.tsx";
import { DefaultProps } from "@core/components/types.ts";

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