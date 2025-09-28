/** @jsx h */
import { h, t } from "../index.ts";
import { PaletteIcon } from "../../design-system/components/icons.tsx";
import { BlockOptionsExtensionPlugin, BlockOptionsMenuItem } from "../block-options/block-options-plugin.tsx";
import { CalloutColorMenu } from "./components/callout-color-menu.tsx";

export class BlockOptionsCalloutExtensionPlugin extends BlockOptionsExtensionPlugin {
    override items(block: HTMLElement): BlockOptionsMenuItem[] {
        if (!block.classList.contains("callout")) return [];

        return [
            {
                id: "callout-colors",
                icon: <PaletteIcon />,
                label: t("callout_colors"),
                sort: 60,
                overlay: (ctx) => (
                    <CalloutColorMenu
                        block={ctx.block}
                        anchor={ctx.trigger}
                    />
                ),
            },
        ];
    }
}
