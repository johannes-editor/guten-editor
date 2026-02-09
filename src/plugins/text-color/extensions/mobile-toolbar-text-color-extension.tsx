import { t } from "@core/i18n";
import { runCommand } from "@core/command";
import { TextColorIcon } from "@components/ui/icons";
import { MobileToolbarButtonExtensionPlugin, MobileToolbarExtensionContext } from "@plugins/mobile-toolbar";

/**
 * Mobile toolbar extension that adds the Text Color menu when text is selected.
 */
export class MobileToolbarTextColorExtension extends MobileToolbarButtonExtensionPlugin {

    override buttons(context: MobileToolbarExtensionContext) {
        const selection = context.selection;
        const isSelectionMode = context.mode === "selection";
        const hasSelectedText = Boolean(selection && !selection.isCollapsed);

        if (!isSelectionMode || !hasSelectedText) return [];

        const anchorNode = selection?.anchorNode;
        const anchorElement = anchorNode instanceof HTMLElement
            ? anchorNode
            : anchorNode?.parentElement ?? undefined;

        return [{
            id: "text-color",
            icon: () => <TextColorIcon />,
            label: t("text_color"),
            sort: 55,
            onClick: () => runCommand("openTextColorMenu", {
                content: { anchor: anchorElement },
            }),
        }];
    }
}