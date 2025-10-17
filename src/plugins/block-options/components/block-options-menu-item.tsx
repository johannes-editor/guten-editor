/** @jsx h */
import { h } from "../../../jsx.ts";

import { MenuItemUI } from "../../../design-system/components/menu-item-ui.tsx";
import { DefaultState } from "../../../components/types.ts";
import { BlockOptionsItemContext } from "../extensible/block-options-plugin.tsx";
import { BlockOptionsMenu } from "./block-options-menu.tsx";
import { DefaultProps } from "../../index.ts";


export interface BlockOptionsMenuItemProps extends DefaultProps {
    icon?: Element;
    label?: string;
    rightIndicator?: "auto" | "check" | "chevron" | "none";
    onSelect?: (context: BlockOptionsItemContext) => void;
    block: HTMLElement;
    getMenuEl: () => BlockOptionsMenu | null;
}

export class BlockOptionsMenuItem<P extends BlockOptionsMenuItemProps, S = DefaultState> extends MenuItemUI<P, S> {


    override onMount(): void {
        this.icon = this.props.icon;
        this.label = this.props.label || "";
        this.rightIndicator = this.props.rightIndicator || "none";

    }

    override onSelect(event: Event): void {

        event.preventDefault();

        const menu = this.props.getMenuEl?.();
        if (!menu) return;

        const trigger = this.resolveTrigger(event);
        if (!trigger) return;

        const ctx: BlockOptionsItemContext = {
            block: this.props.block,
            blockOptions: menu,
            menuComponent: menu,
            trigger,
        };

        this.props.onSelect?.(ctx);
    }

    private resolveTrigger(event: Event): HTMLElement | null {
        if (!(event instanceof Event)) return null;
        const target = event.target instanceof HTMLElement ? event.target : null;
        const button = target?.closest("button");
        if (button) return button as HTMLElement;
        if (event.currentTarget instanceof HTMLElement) {
            const fallback = event.currentTarget.querySelector("button");
            if (fallback) return fallback as HTMLElement;
        }
        return null;
    }


}