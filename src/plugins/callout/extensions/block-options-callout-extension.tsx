/** @jsx h */

import { h } from "@core/jsx/index.ts";
import { t } from "@core/i18n/index.ts";
import { runCommand } from "@core/command/index.ts";
import { PaletteIcon } from "@components/ui/primitives/icons.tsx";
import { BlockOptionsExtensionPlugin, BlockOptionsItem } from "@plugin/block-options/extensible/block-options-plugin.tsx";

export class BlockOptionsCalloutExtension extends BlockOptionsExtensionPlugin {

    override items(block: HTMLElement): BlockOptionsItem[] {
        if (!block.classList.contains("callout")) return [];

        return [
            {
                id: "callout-colors",
                icon: <PaletteIcon />,
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