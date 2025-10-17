/** @jsx h */
import { DefaultProps, h, t } from "../../index.ts";
import { DefaultState, icons, MenuItemUI } from "../../index.ts";
import { ColorVariant } from "./types.ts";

interface CalloutColorMenuItemProps extends DefaultProps {
    variant: ColorVariant;
    block: HTMLElement;
    isActiveVariant: (variant: ColorVariant) => boolean;
    handleBackgroundChange: (variantId: string) => void;
}

export class CalloutColorMenuItem extends MenuItemUI<CalloutColorMenuItemProps, DefaultState> {


    override connectedCallback(): void {
        this.icon = this.renderSwatch(this.props.variant);
        this.label = t(this.props.variant.labelKey);

        super.connectedCallback?.();
    }

    override isActive(): boolean {
        const { variant, isActiveVariant } = this.props;

        return isActiveVariant(variant) || false;
    }

    override onSelect(_event: Event): void {
        const { variant, handleBackgroundChange } = this.props;
        handleBackgroundChange(variant.id || "");
    }


    private renderSwatch(variant: ColorVariant): Element {
        const strokeColor = variant.stroke ?? "var(--color-border)";
        if (variant.rounded) {
            return <icons.SwatchRoundedIcon color={variant.color} strokeColor={strokeColor} strokeWidth={1} size={18} />
        }

        return <icons.SwatchIcon color={variant.color} strokeColor={strokeColor} strokeWidth={1} size={18} />
    }
}