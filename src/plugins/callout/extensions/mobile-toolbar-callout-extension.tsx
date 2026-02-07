import { runCommand } from "@core/command";
import { t } from "@core/i18n";
import { PaletteIcon } from "@components/ui/icons";
import { MobileToolbarButtonExtensionPlugin, MobileToolbarExtensionContext } from "@plugin/mobile-toolbar";

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