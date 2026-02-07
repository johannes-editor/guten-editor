import { TranslationSchema } from "@core/i18n";

export type ColorOption = {
    id: string;
    labelKey: keyof TranslationSchema;
    color: string;
    value: string;
    rounded?: boolean;
    stroke?: string;
};

export const normalizeColorValue = (value: string | null | undefined): string => {
    if (!value) return "";
    const lower = value.trim().toLowerCase();
    if (!lower) return "";
    if (lower === "transparent" || lower === "rgba(0, 0, 0, 0)") return "transparent";
    if (lower === "initial" || lower === "inherit") return "initial";
    const hexMatch = lower.match(/^#([0-9a-f]{3,8})$/i);
    if (hexMatch) {
        const hex = hexMatch[1];
        if (hex.length === 3) {
            return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
        }
        if (hex.length === 6) return `#${hex}`;
    }
    const rgbMatch = lower.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (rgbMatch) {
        const [r, g, b] = rgbMatch.slice(1, 4).map((component) => {
            const num = Math.max(0, Math.min(255, parseInt(component, 10) || 0));
            return num.toString(16).padStart(2, "0");
        });
        return `#${r}${g}${b}`;
    }
    return lower;
};

export const TEXT_COLOR_OPTIONS: ColorOption[] = [
    { id: "default", labelKey: "text_color_default", color: "var(--color-ui-text)", value: "var(--color-ui-text)", rounded: true, stroke: "var(--color-border)" },
    { id: "gray", labelKey: "formatting_color_gray", color: "var(--color-gray-600)", value: "var(--color-gray-600)", rounded: true },
    { id: "red", labelKey: "formatting_color_red", color: "var(--color-red-600)", value: "var(--color-red-600)", rounded: true },
    { id: "green", labelKey: "formatting_color_green", color: "var(--color-green-600)", value: "var(--color-green-600)", rounded: true },
    { id: "blue", labelKey: "formatting_color_blue", color: "var(--color-blue-600)", value: "var(--color-blue-600)", rounded: true },
    { id: "purple", labelKey: "formatting_color_purple", color: "var(--color-purple-600)", value: "var(--color-purple-600)", rounded: true },
];

export const HIGHLIGHT_COLOR_OPTIONS = [
    { id: "none", labelKey: "highlight_color_none", color: "transparent", value: "transparent", stroke: "var(--color-border)" },
    { id: "yellow", labelKey: "formatting_color_yellow", color: "var(--color-yellow-200)", value: "var(--color-yellow-200)" },
    { id: "green", labelKey: "formatting_color_green", color: "var(--color-green-200)", value: "var(--color-green-200)" },
    { id: "blue", labelKey: "formatting_color_blue", color: "var(--color-blue-200)", value: "var(--color-blue-200)" },
    { id: "pink", labelKey: "formatting_color_pink", color: "var(--color-pink-200)", value: "var(--color-pink-200)" },
];