import { t } from "@core/i18n";
import { runCommand } from "@core/command";
import { RowPlusBottomIcon, DeleteRow, DeleteColumn, ColumnPlusRightIcon } from "@components/ui/icons";
import { MobileToolbarButtonExtensionPlugin, MobileToolbarExtensionContext } from "@plugins/mobile-toolbar";
import { findTableFromSelection } from "../commands/table-command-utils.ts";

export class TableMobileToolbarExtension extends MobileToolbarButtonExtensionPlugin {

    override buttons(context: MobileToolbarExtensionContext) {
        const selectionTable = findTableFromSelection(context.selection);
        if (!selectionTable) return [];

        const selection = context.selection ?? undefined;

        return [
            {
                id: "table-add-row",
                icon: () => <RowPlusBottomIcon />,
                label: t("add_row"),
                sort: 110,
                onClick: () => runCommand("table.addRow", { content: selectionTable }),
            },
            {
                id: "table-add-column",
                icon: () => <ColumnPlusRightIcon />,
                label: t("add_column"),
                sort: 120,
                onClick: () => runCommand("table.addColumn", { content: selectionTable }),
            },
            {
                id: "table-delete-row",
                icon: () => <DeleteRow />,
                label: t("delete_row"),
                sort: 130,
                onClick: () => runCommand("table.deleteRow", { content: selectionTable, selection }),
            },
            {
                id: "table-delete-column",
                icon: () => <DeleteColumn />,
                label: t("delete_column"),
                sort: 140,
                onClick: () => runCommand("table.deleteColumn", { content: selectionTable, selection }),
            },
        ];
    }
}
