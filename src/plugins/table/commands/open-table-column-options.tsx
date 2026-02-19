import { Command, CommandContext } from "@core/command";
import { appendElementOnOverlayArea } from "@components/editor";
import { findTableFromSelection } from "./table-command-utils.ts";
import { TableColumnOptionsMenu } from "../components/table-column-options-menu.tsx";

export const OpenTableColumnOptionsCommand: Command = {
    id: "openTableColumnOptions",

    execute(context: CommandContext<{ table?: HTMLTableElement; anchor: HTMLElement }>): boolean {
        const table = context.content?.table ?? findTableFromSelection(context.selection);
        const anchor = context.content?.anchor;

        if (!table || !anchor) return false;

        appendElementOnOverlayArea(
            <TableColumnOptionsMenu
                table={table}
                anchor={anchor}
            />
        );

        return true;
    }
};