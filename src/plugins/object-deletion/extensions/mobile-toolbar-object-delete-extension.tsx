import { t } from "@core/i18n";
import { runCommand } from "@core/command";
import { TrashIcon } from "@components/ui/icons";
import { MobileToolbarButtonExtensionPlugin, MobileToolbarExtensionContext } from "@plugins/mobile-toolbar";
import { getFocusedObject } from "../object-deletion-utils.ts";

export class MobileToolbarObjectDeleteExtension extends MobileToolbarButtonExtensionPlugin {
    override buttons(context: MobileToolbarExtensionContext) {
        if (context.mode !== "default") return [];
        if (!getFocusedObject()) return [];

        return [{
            id: "delete-focused-object",
            icon: () => <TrashIcon />,
            label: t("delete_selected_object"),
            sort: 41,
            onClick: () => runCommand("deleteFocusedObject"),
        }];
    }
}