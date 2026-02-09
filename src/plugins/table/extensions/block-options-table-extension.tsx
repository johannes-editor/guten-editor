import { t } from "@core/i18n";
import { runCommand } from "@core/command";
import { AddColumnRight, AddRowBelow, DeleteColumn, DeleteRow, } from "@components/ui/icons";
import { BlockOptionsExtensionPlugin, BlockOptionsItem } from "@plugins/block-options";

export class BlockOptionsTableExtension extends BlockOptionsExtensionPlugin {

    override items(block: HTMLElement): BlockOptionsItem[] {
        if (!block.classList.contains("table-block")) return [];

        const table = block.querySelector("table");
        const selection = undefined;

        return [
            
            {
                id: "callout-colors",
                icon: <AddRowBelow />,
                // label: t("add_row"),
                label: "Row",
                sort: 60,
                rightIndicator: "chevron",
                onSelect: (ctx) => {
                    runCommand("table.addRow", { content: table });
                }
            },
            {
                id: "callout-colors",
                icon: <AddColumnRight />,
                // label: t("add_row"),
                label: "Column",
                sort: 60,
                rightIndicator: "chevron",
                onSelect: (ctx) => {
                    runCommand("table.addRow", { content: table });
                }
            },
            
            // {
            //     id: "callout-colors",
            //     icon: <AddRowBelow />,
            //     // label: t("add_row"),
            //     label: "Add row",
            //     sort: 60,
            //     // rightIndicator: "chevron",
            //     onSelect: (ctx) => {
            //         runCommand("table.addRow", { content: table });
            //     }
            // },
            // {
            //     id: "callout-colors",
            //     icon: <AddColumnRight />,
            //     // label: t("add_column"),
            //     label: "Add column",
            //     sort: 60,
            //     // rightIndicator: "chevron",
            //     onSelect: (ctx) => {
            //         runCommand("table.addColumn", { content: table });
            //     }
            // },
            // {
            //     id: "callout-colors",
            //     icon: <DeleteRow />,
            //     // label: t("delete_row"),
            //     label: "Delete row",
            //     sort: 60,
            //     // rightIndicator: "chevron",
            //     onSelect: (ctx) => {
            //         runCommand("table.deleteRow", { content: table, selection });
            //     }
            // },
            // {
            //     id: "callout-colors",
            //     icon: <DeleteColumn />,
            //     // label: t("delete_column"),
            //     label: "Delete column",
            //     sort: 60,
            //     // rightIndicator: "chevron",
            //     onSelect: (ctx) => {
            //         runCommand("table.deleteColumn", { content: table, selection });
            //     }
            // },
        ];
    }
}