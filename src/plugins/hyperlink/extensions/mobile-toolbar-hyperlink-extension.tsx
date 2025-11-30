/** @jsx h */

import { h, icons, runCommand, t } from "../../index.ts";
import { MobileToolbarButtonExtensionPlugin, MobileToolbarExtensionContext } from "../../mobile-toolbar/mobile-toolbar-plugin.tsx";


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
            icon: () => <icons.LinkIcon />,
            label: t("link"),
            sort: 50,
            onClick: () => runCommand("openLinkPopover"),
        }];
    }
}