/** @jsx h */
import { DefaultState, MenuItemUI, icons, h, t } from "../../index.ts";
import type { ColorOption } from "./color-options.ts";

interface ColorMenuItemProps {
    option: ColorOption;
    isActive: (option: ColorOption) => boolean;
    onSelectOption: (option: ColorOption) => void;
}

export class FormattingToolbarColorMenuItem extends MenuItemUI<ColorMenuItemProps, DefaultState> {



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
        this.icon = this.renderSwatch(this.props.option);
        this.label = t(this.props.option.labelKey);
        this.rightIndicator = "none";
        super.connectedCallback?.();
    }

    override isActive(): boolean {
        return this.props.isActive(this.props.option);
    }

    override onSelect(_event: Event): void {
        this.props.onSelectOption(this.props.option);
    }

    private renderSwatch(option: ColorOption): Element {
        const strokeColor = option.stroke ?? "var(--color-border)";
        if (option.rounded) {
            return (
                <span style={`color: ${option.color}`}>
                    <icons.AlphabetIcon />
                </span>
            );
        }

        return <icons.SwatchIcon color={option.color} strokeColor={strokeColor} strokeWidth={1} size={18} />;
    }
}