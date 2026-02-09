import { t } from "@core/i18n";
import { runCommand } from "@core/command";
import { CodeSlashIcon } from "@components/ui/icons";
import { MobileToolbarButtonExtensionPlugin, MobileToolbarExtensionContext } from "@plugins/mobile-toolbar";

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