/** @jsx h */

import { h } from "@core/jsx/index.ts";
import { runCommand } from "@core/command/index.ts";
import { t } from "@core/i18n/index.ts";
import { PaletteIcon } from "@components/ui/primitives/icons.tsx";
import { MobileToolbarButtonExtensionPlugin, MobileToolbarExtensionContext } from "@plugin/mobile-toolbar/index.ts";

export class CalloutMobileToolbarExtension extends MobileToolbarButtonExtensionPlugin {

    override buttons(context: MobileToolbarExtensionContext) {

        if (context.mode === "selection") return [];

        const callout = this.findActiveCallout(context);
        if (!callout) return [];

        return [
            {
                id: "callout-colors",
                icon: () => <PaletteIcon />,
                label: t("callout_colors"),
                sort: 60,
                onClick: () => {
                    runCommand("openCalloutColorOptions", { content: { block: callout, anchor: callout } });
                },
            },
        ];
    }

    private findActiveCallout(context: MobileToolbarExtensionContext): HTMLElement | null {
        const anchorNode = context.selection?.anchorNode;
        if (!anchorNode) return null;

        const element = anchorNode instanceof Element ? anchorNode : anchorNode.parentElement;
        return (element?.closest?.(".callout") as HTMLElement | null) ?? null;
    }
}