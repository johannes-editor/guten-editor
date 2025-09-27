/** @jsx h */
import { h, t } from "../index.ts";
import type { TranslationSchema } from "../../core/i18n/types.ts";
import { BlockOptionsExtensionPlugin, BlockOptionsMenuItem } from "../block-options/block-options-plugin.tsx";

const VARIANTS: Array<{ id: string; labelKey: keyof TranslationSchema; color: string }> = [
    { id: "", labelKey: "callout_color_default", color: "var(--color-callout)" },
    { id: "info", labelKey: "callout_color_info", color: "var(--color-callout-info)" },
    { id: "success", labelKey: "callout_color_success", color: "var(--color-callout-success)" },
    { id: "warning", labelKey: "callout_color_warning", color: "var(--color-callout-warning)" },
    { id: "danger", labelKey: "callout_color_danger", color: "var(--color-callout-danger)" },
];

export class BlockOptionsCalloutExtensionPlugin extends BlockOptionsExtensionPlugin {
    override items(block: HTMLElement): BlockOptionsMenuItem[] {
        if (!block.classList.contains("callout")) return [];

        const currentVariant = block.getAttribute("data-callout-variant") ?? "";

        return VARIANTS.map((variant, index) => ({
            id: `callout-variant-${variant.id || "default"}`,
            icon: this.renderSwatch(variant.color, index),
            label: t(variant.labelKey),
            sort: 60 + index,
            isActive: () => currentVariant === variant.id,
            onSelect: ({ block: callout, close }) => {
                if (variant.id) {
                    callout.setAttribute("data-callout-variant", variant.id);
                } else {
                    callout.removeAttribute("data-callout-variant");
                }
                close();
            },
        }));
    }

    private renderSwatch(color: string, key: number): Element {
        return (
            <svg
                key={key}
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
            >
                <rect x="1" y="1" width="16" height="16" rx="4" fill={color} stroke="currentColor" stroke-width="1" />
            </svg>
        );
    }
}
