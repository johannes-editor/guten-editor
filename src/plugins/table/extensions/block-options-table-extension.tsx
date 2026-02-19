import { runCommand } from "@core/command";
import { RowIcon, ColumnIcon } from "@components/ui/icons";
import { BlockOptionsExtensionPlugin, BlockOptionsItem } from "../../block-controls/index.ts";
import { findRowIndexFromSelection } from "../commands/table-command-utils.ts";

export class BlockOptionsTableExtension extends BlockOptionsExtensionPlugin {

    override items(block: HTMLElement): BlockOptionsItem[] {
        if (!block.classList.contains("table-block")) return [];

        const table = block.querySelector("table");
        if (!table) return [];

        return [
            {
                id: "table-row-options",
                icon: <RowIcon />,
                label: "Row",
                sort: 60,
                rightIndicator: "chevron",
                onSelect: (ctx) => {
                    const rowIndex = findRowIndexFromSelection(table) ?? 0;
                    runCommand("openTableRowOptions", { content: { table, anchor: ctx.trigger, rowIndex } });
                }
            },
            {
                id: "table-column-options",
                icon: <ColumnIcon />,
                label: "Column",
                sort: 61,
                rightIndicator: "chevron",
                onSelect: (ctx) => {
                    runCommand("openTableColumnOptions", { content: { table, anchor: ctx.trigger } });
                }
            },
        ];
    }
}