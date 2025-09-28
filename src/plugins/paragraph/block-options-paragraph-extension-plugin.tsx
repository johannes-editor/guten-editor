/** @jsx h */
import { h, t } from "../index.ts";
import { BlockOptionsExtensionPlugin, BlockOptionsMenuItem } from "../block-options/block-options-plugin.tsx";
import { AlignCenterIcon, AlignJustifyIcon, AlignLeftIcon, AlignRightIcon } from "../../design-system/components/icons.tsx";
import type { TranslationSchema } from "../../core/i18n/types.ts";

const ALIGNMENTS: Array<{
    id: string;
    labelKey: keyof TranslationSchema;
    value: "" | "left" | "center" | "right" | "justify";
    icon: Element;
}> = [
    { id: "left", labelKey: "align_left", value: "", icon: <AlignLeftIcon /> },
    { id: "center", labelKey: "align_center", value: "center", icon: <AlignCenterIcon /> },
    { id: "right", labelKey: "align_right", value: "right", icon: <AlignRightIcon /> },
    { id: "justify", labelKey: "align_justify", value: "justify", icon: <AlignJustifyIcon /> },
];

export class BlockOptionsParagraphExtensionPlugin extends BlockOptionsExtensionPlugin {
    override items(block: HTMLElement): BlockOptionsMenuItem[] {
        if (block.tagName !== "P") return [];

        const current = (block.style.textAlign || "") as "" | "left" | "center" | "right" | "justify";

        return ALIGNMENTS.map((alignment, index) => ({
            id: `paragraph-align-${alignment.id}`,
            icon: alignment.icon,
            label: t(alignment.labelKey),
            sort: 80 + index,
            isActive: () => (alignment.value === "" ? current === "" || current === "left" : current === alignment.value),
            onSelect: ({ block: paragraph, close }) => {
                if (alignment.value === "" || alignment.value === "left") {
                    paragraph.style.removeProperty("text-align");
                } else {
                    paragraph.style.textAlign = alignment.value;
                }
                close();
            },
        }));
    }
}
