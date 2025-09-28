/** @jsx h */
import { h, t } from "../index.ts";
import type { TranslationSchema } from "../../core/i18n/types.ts";
import { PaletteIcon } from "../../design-system/components/icons.tsx";
import { BlockOptionsExtensionPlugin, BlockOptionsMenuItem } from "../block-options/block-options-plugin.tsx";

const BACKGROUND_VARIANTS: Array<{ id: string; labelKey: keyof TranslationSchema; color: string }> = [
    { id: "", labelKey: "callout_color_default", color: "var(--color-callout)" },
    { id: "info", labelKey: "callout_color_info", color: "var(--color-callout-info)" },
    { id: "success", labelKey: "callout_color_success", color: "var(--color-callout-success)" },
    { id: "warning", labelKey: "callout_color_warning", color: "var(--color-callout-warning)" },
    { id: "danger", labelKey: "callout_color_danger", color: "var(--color-callout-danger)" },
];

const TEXT_VARIANTS: Array<{ id: string; labelKey: keyof TranslationSchema; color: string }> = [
    { id: "", labelKey: "callout_text_default", color: "var(--color-callout-text-default)" },
    { id: "muted", labelKey: "callout_text_muted", color: "var(--color-callout-text-muted)" },
    { id: "light", labelKey: "callout_text_light", color: "var(--color-callout-text-light)" },
    { id: "accent", labelKey: "callout_text_accent", color: "var(--color-callout-text-accent)" },
];

export class BlockOptionsCalloutExtensionPlugin extends BlockOptionsExtensionPlugin {
    override items(block: HTMLElement): BlockOptionsMenuItem[] {
        if (!block.classList.contains("callout")) return [];

        return [
            {
                id: "callout-colors",
                icon: <PaletteIcon />,
                label: t("callout_colors"),
                sort: 60,
                submenu: (ctx) => this.buildColorMenu(ctx.block),
            },
        ];
    }

    private buildColorMenu(block: HTMLElement): BlockOptionsMenuItem[] {
        const backgroundItems = BACKGROUND_VARIANTS.map((variant, index) => ({
            id: `callout-background-${variant.id || "default"}`,
            icon: this.renderSwatch(variant.color, index, { rounded: true }),
            label: t(variant.labelKey),
            isActive: () => (block.getAttribute("data-callout-variant") ?? "") === variant.id,
            onSelect: ({ block: callout, blockOptions, trigger }) => {
                if (variant.id) {
                    callout.setAttribute("data-callout-variant", variant.id);
                } else {
                    callout.removeAttribute("data-callout-variant");
                }
                this.updateGroupActiveState(blockOptions, "callout-background-", trigger);
            },
        }));

        const textItems = TEXT_VARIANTS.map((variant, index) => ({
            id: `callout-text-${variant.id || "default"}`,
            icon: this.renderSwatch(variant.color, index + BACKGROUND_VARIANTS.length, { stroke: "var(--color-border)" }),
            label: t(variant.labelKey),
            isActive: () => (block.getAttribute("data-callout-text-color") ?? "") === variant.id,
            onSelect: ({ block: callout, blockOptions, trigger }) => {
                if (variant.id) {
                    callout.setAttribute("data-callout-text-color", variant.id);
                } else {
                    callout.removeAttribute("data-callout-text-color");
                }
                this.updateGroupActiveState(blockOptions, "callout-text-", trigger);
            },
        }));

        return [
            {
                id: "callout-background-label",
                type: "label",
                label: t("callout_background_label"),
            },
            ...backgroundItems,
            {
                id: "callout-color-separator",
                type: "separator",
            },
            {
                id: "callout-text-label",
                type: "label",
                label: t("callout_text_label"),
            },
            ...textItems,
        ];
    }

    private renderSwatch(color: string, key: number, options: { rounded?: boolean; stroke?: string } = {}): Element {
        const { rounded = false, stroke } = options;

        return (
            <svg
                key={key}
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
            >
                {rounded
                    ? <circle cx="9" cy="9" r="8" fill={color} stroke={stroke ?? "currentColor"} stroke-width="1" />
                    : <rect x="1" y="1" width="16" height="16" rx="4" fill={color} stroke={stroke ?? "currentColor"} stroke-width="1" />}
            </svg>
        );
    }

    private updateGroupActiveState(blockOptions: HTMLElement, prefix: string, trigger: HTMLElement): void {
        const items = blockOptions.querySelectorAll(`[data-block-options-id^="${prefix}"]`);
        items.forEach((item) => {
            item.classList.remove("active");
        });

        const container = trigger.closest(".guten-menu-item");
        if (container) {
            container.classList.add("active");
        }
    }
}
