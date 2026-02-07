import { runCommand } from "@core/command";
import { t } from "@core/i18n";
import { LinkIcon } from "@components/ui/icons";
import { MobileToolbarButtonExtensionPlugin, MobileToolbarExtensionContext } from "@plugin/mobile-toolbar";


/**
 * Mobile toolbar extension that adds the "Insert Link" button when text is selected.
 */
export class HyperlinkMobileToolbarExtension extends MobileToolbarButtonExtensionPlugin {

    override buttons(context: MobileToolbarExtensionContext) {
        const selection = context.selection;
        const isSelectionMode = context.mode === "selection";
        const hasSelectedText = Boolean(selection && !selection.isCollapsed);

        if (!isSelectionMode || !hasSelectedText) return [];

        return [{
            id: "insert-link",
            icon: () => <LinkIcon />,
            label: t("link"),
            sort: 50,
            onClick: () => runCommand("openLinkPopover"),
        }];
    }
}