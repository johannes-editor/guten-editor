/** @jsx h */
import { h, runCommand, t, icons } from "../../index.ts";
import { BlockOptionsExtensionPlugin, BlockOptionsItem } from "../../block-options/extensible/block-options-plugin.tsx";

export class BlockOptionsCalloutExtension extends BlockOptionsExtensionPlugin {

    override items(block: HTMLElement): BlockOptionsItem[] {
        if (!block.classList.contains("callout")) return [];

        return [
            {
                id: "callout-colors",
                icon: <icons.PaletteIcon />,
                label: t("callout_colors"),
                sort: 60,
                rightIndicator: "chevron",
                onSelect: (ctx) => {
                    runCommand("openCalloutColorOptions", { content: { block: ctx.block, anchor: ctx.trigger } });
                }
            },
        ];
    }
}