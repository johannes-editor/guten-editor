/** @jsx h */

import { h } from "@core/jsx/index.ts";
import { t } from "@core/i18n/index.ts";
import { runCommand } from "@core/command/index.ts";
import { CodeSlashIcon } from "@components/ui/primitives/icons.tsx";
import { MobileToolbarButtonExtensionPlugin, MobileToolbarExtensionContext } from "@plugin/mobile-toolbar/index.ts";

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
            icon: () => <CodeSlashIcon />,
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