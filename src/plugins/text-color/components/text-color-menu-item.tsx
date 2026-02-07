/** @jsx h */

import { h } from "@core/jsx/index.ts";
import { t } from "@core/i18n/index.ts";
import { MenuItemUI } from "@components/ui/composites/menu/index.ts";
import { DefaultState } from "@core/components/types.ts";
import { AlphabetIcon, SwatchIcon } from "@components/ui/primitives/icons.tsx";
import { ColorOption } from "../color-options.ts";


interface TextColorMenuItemProps {
    option: ColorOption;
    isActive: (option: ColorOption) => boolean;
    onSelectOption: (option: ColorOption) => void;
}

export class TextColorMenuItem extends MenuItemUI<TextColorMenuItemProps, DefaultState> {

    override state: DefaultState = { isActive: false };

    static override get tagName() {
        return "guten-formatting-color-menu-item";
    }

    static override styles = this.extendStyles(/*css */`
        
        guten-formatting-color-menu-item svg {
            width: 18px !important;
            height: 18px !important;
        }
    ` );

    override connectedCallback(): void {
        const isActive = this.props.isActive(this.props.option);
        this.state = { ...this.state, isActive };
        if (this.props.option.id === "default" || this.props.option.id === "none") {
            this.rightIndicator = "none";
        }
        this.icon = this.renderSwatch(this.props.option);
        this.label = t(this.props.option.labelKey);
        super.connectedCallback?.();
    }

    override isActive(): boolean {
        return Boolean(this.state.isActive);
    }

    override afterRender(): void {
        super.afterRender?.();
        this.toggleAttribute("data-active", this.isActive());
    }

    override onSelect(_event: Event): void {
        this.props.onSelectOption(this.props.option);
    }

    private renderSwatch(option: ColorOption): Element {
        const strokeColor = option.stroke ?? "var(--color-border)";
        if (option.rounded) {
            return (
                <span style={`color: ${option.color}`}>
                    <AlphabetIcon />
                </span>
            );
        }

        return <SwatchIcon color={option.color} strokeColor={strokeColor} strokeWidth={1} size={18} />;
    }
}