import { Command, CommandContext } from "@core/command";
import { appendElementOnOverlayArea } from "@components/editor";
import { findColumnIndexFromSelection, findTableFromSelection } from "./table-command-utils.ts";
import { TableColumnOptionsMenu } from "../components/table-column-options-menu.tsx";

export const OpenTableColumnOptionsCommand: Command = {
    id: "openTableColumnOptions",

    execute(context: CommandContext<{ table?: HTMLTableElement; anchor: HTMLElement; columnIndex?: number }>): boolean {
        const table = context.content?.table ?? findTableFromSelection(context.selection);
        const anchor = context.content?.anchor;
        const columnIndex = context.content?.columnIndex ?? (table ? findColumnIndexFromSelection(table, context.selection) : null) ?? 0;

        const targetCell = table?.querySelectorAll<HTMLTableRowElement>("tr")[0]?.cells[columnIndex] ?? null;

        if (!table || !anchor) return false;

        appendElementOnOverlayArea(
            <TableColumnOptionsMenu
                table={table}
                anchor={anchor}
                columnIndex={columnIndex}
                targetCell={targetCell}
            />
        );

        return true;
    }
};