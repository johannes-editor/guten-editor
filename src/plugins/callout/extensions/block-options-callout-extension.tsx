/** @jsx h */

import { h } from "@core/jsx";
import { t } from "@core/i18n";
import { runCommand } from "@core/command";
import { PaletteIcon } from "@components/ui/icons";
import { BlockOptionsExtensionPlugin, BlockOptionsItem } from "@plugin/block-options";

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