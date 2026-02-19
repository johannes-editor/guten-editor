import { Command, CommandContext } from "@core/command";
import { appendElementOnOverlayArea } from "@components/editor";
import { findTableFromSelection } from "./table-command-utils.ts";
import { TableRowOptionsMenu } from "../components/table-row-options-menu.tsx";

export const OpenTableRowOptionsCommand: Command = {
    id: "openTableRowOptions",

    execute(context: CommandContext<{ table?: HTMLTableElement; anchor: HTMLElement }>): boolean {
        const table = context.content?.table ?? findTableFromSelection(context.selection);
        const anchor = context.content?.anchor;

        if (!table || !anchor) return false;

        appendElementOnOverlayArea(
            <TableRowOptionsMenu
                table={table}
                anchor={anchor}
            />
        );

        return true;
    }
};