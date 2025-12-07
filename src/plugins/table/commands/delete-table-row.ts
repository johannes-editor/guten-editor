import type { Command } from "../../index.ts";
import { deleteRowFromTable, resolveTableFromContext } from "./table-command-utils.ts";

export const DeleteTableRowCommand: Command = {
    id: "table.deleteRow",
    execute: (context) => {
        console.log("DeleteTableRowCommand executed");
        const table = resolveTableFromContext(context);
        if (!table) return false;

        return deleteRowFromTable(table, context);
    },
};