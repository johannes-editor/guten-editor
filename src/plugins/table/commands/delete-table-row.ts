import { Command } from "@core/command";
import { deleteRowFromTable, resolveTableFromContext } from "./table-command-utils.ts";

export const DeleteTableRowCommand: Command = {
    id: "table.deleteRow",
    execute: (context) => {
        const table = resolveTableFromContext(context);
        if (!table) return false;

        return deleteRowFromTable(table, context);
    },
};