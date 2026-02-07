/** @jsx h */

import { h } from "@core/jsx";
import { t } from "@core/i18n";
import { DefaultProps, DefaultState } from "@core/components";
import { SwatchRoundedIcon, SwatchIcon } from "@components/ui/icons";
import { MenuItemUI } from "@components/ui/composites/menu";
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
        const strokeColor = variant.stroke ?? `color-mix(in srgb, ${variant.color} 70%, #000 30%)`;
        if (variant.rounded) {
            return <SwatchRoundedIcon color={variant.color} strokeColor={strokeColor} strokeWidth={1} size={18} />
        }

        return <SwatchIcon color={variant.color} strokeColor={strokeColor} strokeWidth={1} size={18} />
    }
}