/** @jsx h */
import { h, t } from "../../index.ts";
import { type BlockOptionsProps } from "../../drag-and-drop/components/block-options.tsx";
import { BlockOptionsOverlayMenu } from "../../drag-and-drop/components/block-options-overlay-menu.tsx";
import { BlockOptionsItem } from "../../drag-and-drop/components/block-options-item.tsx";
import type { TranslationSchema } from "../../../core/i18n/types.ts";
import type { DefaultState } from "../../../components/types.ts";

interface CalloutColorMenuProps extends BlockOptionsProps {
    block: HTMLElement;
    anchor: HTMLElement;
}

interface CalloutColorMenuState extends DefaultState {
    background: string;
    text: string;
}

type ColorVariant = {
    id: string;
    labelKey: keyof TranslationSchema;
    color: string;
    rounded?: boolean;
    stroke?: string;
};

const BACKGROUND_VARIANTS: ColorVariant[] = [
    { id: "", labelKey: "callout_color_default", color: "var(--color-callout)", rounded: true },
    { id: "info", labelKey: "callout_color_info", color: "var(--color-callout-info)", rounded: true },
    { id: "success", labelKey: "callout_color_success", color: "var(--color-callout-success)", rounded: true },
    { id: "warning", labelKey: "callout_color_warning", color: "var(--color-callout-warning)", rounded: true },
    { id: "danger", labelKey: "callout_color_danger", color: "var(--color-callout-danger)", rounded: true },
];

const TEXT_VARIANTS: ColorVariant[] = [
    { id: "", labelKey: "callout_text_default", color: "var(--color-callout-text-default)", stroke: "var(--color-border)" },
    { id: "muted", labelKey: "callout_text_muted", color: "var(--color-callout-text-muted)", stroke: "var(--color-border)" },
    { id: "light", labelKey: "callout_text_light", color: "var(--color-callout-text-light)", stroke: "var(--color-border)" },
    { id: "accent", labelKey: "callout_text_accent", color: "var(--color-callout-text-accent)", stroke: "var(--color-border)" },
];

export class CalloutColorMenu extends BlockOptionsOverlayMenu<CalloutColorMenuProps, CalloutColorMenuState> {

    override props: CalloutColorMenuProps = {} as CalloutColorMenuProps;
    override state: CalloutColorMenuState = {
        background: "",
        text: "",
    };

    static override styles = this.extendStyles(/*css*/`
        .guten-callout-color-menu {
            min-width: 240px;
        }

        .guten-callout-color-menu .guten-menu-item button {
            justify-content: flex-start;
            gap: var(--space-sm);
        }

        .guten-callout-color-menu svg {
            width: 18px;
            height: 18px;
        }
    `);


    override onMount(): void {
        super.onMount();
        this.syncStateFromBlock();
    }

    private syncStateFromBlock(): void {
        const { block } = this.props;
        const background = block.getAttribute("data-callout-variant") ?? "";
        const text = block.getAttribute("data-callout-text-color") ?? "";
        this.setState({ background, text });
    }

    private handleBackgroundChange = (variantId: string) => {
        const { block } = this.props;
        if (variantId) {
            block.setAttribute("data-callout-variant", variantId);
        } else {
            block.removeAttribute("data-callout-variant");
        }
        this.setState({ background: variantId });
    };

    private handleTextChange = (variantId: string) => {
        const { block } = this.props;
        if (variantId) {
            block.setAttribute("data-callout-text-color", variantId);
        } else {
            block.removeAttribute("data-callout-text-color");
        }
        this.setState({ text: variantId });
    };

    private renderLabel(labelKey: keyof TranslationSchema): HTMLElement {
        return (
            <div class="guten-menu-label">
                {t(labelKey)}
            </div>
        ) as HTMLElement;
    }

    private renderSeparator(): HTMLElement {
        return (
            <hr class="guten-menu-separator" />
        ) as HTMLElement;
    }

    private renderVariant(
        variant: ColorVariant,
        isActive: boolean,
        onSelect: (id: string) => void,
        dataIdPrefix: string,
    ): HTMLElement {
        return (
            <BlockOptionsItem
                icon={this.renderSwatch(variant, isActive)}
                label={t(variant.labelKey)}
                isActive={isActive}
                onSelect={() => onSelect(variant.id)}
                data-block-options-id={`${dataIdPrefix}${variant.id || "default"}`}
            />
        ) as HTMLElement;
    }

    private renderSwatch(variant: ColorVariant, isActive: boolean): Element {
        const strokeColor = isActive
            ? "var(--color-primary)"
            : (variant.stroke ?? "currentColor");

        if (variant.rounded) {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18">
                    <circle cx="9" cy="9" r="8" fill={variant.color} stroke={strokeColor} stroke-width="1" />
                </svg>
            );
        }

        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18">
                <rect x="1" y="1" width="16" height="16" rx="4" fill={variant.color} stroke={strokeColor} stroke-width="1" />
            </svg>
        );
    }

    override render(): HTMLElement {
        const { background, text } = this.state;

        const backgroundItems = BACKGROUND_VARIANTS.map((variant) =>
            this.renderVariant(variant, background === variant.id, this.handleBackgroundChange, "callout-background-")
        );

        const textItems = TEXT_VARIANTS.map((variant) =>
            this.renderVariant(variant, text === variant.id, this.handleTextChange, "callout-text-")
        );

        const items = [
            this.renderLabel("callout_background_label"),
            ...backgroundItems,
            this.renderSeparator(),
            this.renderLabel("callout_text_label"),
            ...textItems,
        ];

        return (
            <div class="guten-menu guten-callout-color-menu">
                <ul>
                    {items.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            </div>
        ) as HTMLElement;
    }
}
