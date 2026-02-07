/** @jsx h */

import { h } from "@core/jsx";
import type { DefaultState } from "@core/components";
import type { OverlayCtor } from "@components/editor/overlay";
import { BlockOptionsMenu, type BlockOptionsProps } from "./block-options-menu.tsx";

export interface BlockOptionsOverlayMenuProps extends BlockOptionsProps {
    anchor?: HTMLElement;
}

export abstract class BlockOptionsOverlayMenu<Props extends BlockOptionsOverlayMenuProps = BlockOptionsOverlayMenuProps, State extends DefaultState = DefaultState> extends BlockOptionsMenu {

    override props: Props = {} as Props;

    override canOverlayClasses: ReadonlySet<OverlayCtor> = new Set<OverlayCtor>([BlockOptionsMenu]);

    override afterRender(): void {

        super.afterRender();

        const anchor = this.props.anchor;

        if (anchor) {
            requestAnimationFrame(

                () => this.positionRelativeToMenu(anchor));
        }
    }
}