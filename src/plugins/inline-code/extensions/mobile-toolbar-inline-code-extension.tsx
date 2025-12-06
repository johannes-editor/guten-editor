/** @jsx h */

import { h, icons, runCommand, t } from "../../index.ts";
import { MobileToolbarButtonExtensionPlugin, MobileToolbarExtensionContext } from "../../mobile-toolbar/index.ts";

/**
 * Mobile toolbar extension that adds the Inline Code toggle when text is selected.
 */
export class MobileToolbarInlineCodeExtension extends MobileToolbarButtonExtensionPlugin {

    override buttons(context: MobileToolbarExtensionContext) {
        const selection = context.selection;
        const isSelectionMode = context.mode === "selection";
        const hasSelectedText = Boolean(selection && !selection.isCollapsed);

        if (!isSelectionMode || !hasSelectedText) return [];

        return [{
            id: "inline-code",
            icon: () => <icons.CodeSlashIcon />,
            label: t("code"),
            sort: 45,
            onClick: () => runCommand("toggleInlineCode"),
            isActive: () => {
                try {
                    return !!runCommand("stateInlineCode");
                } catch {
                    return false;
                }
            },
        }];
    }
}