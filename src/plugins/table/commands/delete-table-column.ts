import { Command } from "@core/command";
import { deleteColumnFromTable, resolveTableFromContext } from "./table-command-utils.ts";

export const DeleteTableColumnCommand: Command = {
    id: "table.deleteColumn",
    execute: (context) => {
        const table = resolveTableFromContext(context);
        if (!table) return false;

        return deleteColumnFromTable(table, context);
    },
};