import { cleanupCaretAnchor } from "@utils/selection";
import { MenuUI } from "@components/ui/composites/menu";
import { DefaultProps } from "@core/components";
import { EventTypes } from "@utils/dom";

export interface BlockOptionsProps extends DefaultProps {

}

export class BlockOptionsMenu extends MenuUI<BlockOptionsProps> {

    override closeOnAnchorLoss: boolean = false;

    override props: BlockOptionsProps = {} as BlockOptionsProps;
    
    private shouldRestoreAnchorSelection = true;

    override onUnmount(): void {
        super.onUnmount();
        cleanupCaretAnchor(this.props.anchor ?? null, {
            restoreSelection: this.shouldRestoreAnchorSelection,
        });
    }

    override connectedCallback(): void {
        this.registerEvent(document, EventTypes.GutenOverlayGroupClose, () => {
            this.shouldRestoreAnchorSelection = false;
        });
        super.connectedCallback();
    }
}