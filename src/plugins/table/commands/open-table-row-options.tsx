import { Command, CommandContext } from "@core/command";
import { appendElementOnOverlayArea } from "@components/editor";
import { findRowIndexFromSelection, findTableFromSelection } from "./table-command-utils.ts";
import { TableRowOptionsMenu } from "../components/table-row-options-menu.tsx";

export const OpenTableRowOptionsCommand: Command = {
    id: "openTableRowOptions",

    execute(context: CommandContext<{ table?: HTMLTableElement; anchor: HTMLElement; rowIndex?: number }>): boolean {
        const table = context.content?.table ?? findTableFromSelection(context.selection);
        const anchor = context.content?.anchor;
        const rowIndex = context.content?.rowIndex
            ?? (table ? findRowIndexFromSelection(table, context.selection) : null)
            ?? 0;

        if (!table || !anchor) return false;

        appendElementOnOverlayArea(
            <TableRowOptionsMenu
                table={table}
                anchor={anchor}
                rowIndex={rowIndex}
            />
        );

        return true;
    }
};