/** @jsx h */

import { h, icons, runCommand, t } from "../../index.ts";
import { MobileToolbarButtonExtensionPlugin, MobileToolbarExtensionContext } from "../../mobile-toolbar/index.ts";
import { findTableFromSelection } from "../commands/table-command-utils.ts";

export class TableMobileToolbarExtension extends MobileToolbarButtonExtensionPlugin {

    override buttons(context: MobileToolbarExtensionContext) {
        const selectionTable = findTableFromSelection(context.selection);
        if (!selectionTable) return [];

        return [
            {
                id: "table-add-row",
                icon: () => <icons.AddRowBelow />,
                label: t("add_row"),
                sort: 110,
                onClick: () => runCommand("table.addRow", { content: selectionTable }),
            },
            {
                id: "table-add-column",
                icon: () => <icons.AddColumnRight />,
                label: t("add_column"),
                sort: 120,
                onClick: () => runCommand("table.addColumn", { content: selectionTable }),
            },
        ];
    }
}
