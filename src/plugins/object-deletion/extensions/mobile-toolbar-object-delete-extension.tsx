import { t } from "@core/i18n";
import { runCommand } from "@core/command";
import { HighlightColorIcon, TrashIcon } from "@components/ui/icons";
import { MobileToolbarButtonExtensionPlugin, MobileToolbarExtensionContext } from "@plugins/mobile-toolbar";
import { getFocusedObject, openEditorForObject } from "../object-deletion-utils.ts";

export class MobileToolbarObjectDeleteExtension extends MobileToolbarButtonExtensionPlugin {
    override buttons(context: MobileToolbarExtensionContext) {
        if (context.mode !== "default") return [];
        const focusedObject = getFocusedObject();
        if (!focusedObject) return [];

        return [{
            id: "edit-focused-object",
            icon: () => <HighlightColorIcon />,
            label: t("edit_selected_object"),
            sort: 40,
            onClick: () => openEditorForObject(focusedObject),
        }, {
            id: "delete-focused-object",
            icon: () => <TrashIcon />,
            label: t("delete_selected_object"),
            sort: 41,
            onClick: () => runCommand("deleteFocusedObject"),
        }];
    }
}