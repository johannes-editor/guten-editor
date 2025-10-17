/** @jsx h */
import { h } from "../../index.ts";
import { MenuUI } from "../../../design-system/components/menu-ui.tsx";
import { DefaultProps } from "../../../components/types.ts";

export interface BlockOptionsProps extends DefaultProps {

}

export class BlockOptionsMenu extends MenuUI<BlockOptionsProps> {

    override closeOnAnchorLoss: boolean = false;

    override props: BlockOptionsProps = {} as BlockOptionsProps;
}