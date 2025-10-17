/** @jsx h */
import { BlockOptionsMenu, type BlockOptionsProps } from "./block-options-menu.tsx";
import type { DefaultState } from "../../../components/types.ts";
import type { OverlayCtor } from "../../../components/overlay/overlay-component.ts";

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