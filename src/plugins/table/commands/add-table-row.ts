import { Command } from "@core/command/index.ts";
import { addRowToTable, resolveTableFromContext } from "./table-command-utils.ts";

export const AddTableRowCommand: Command = {
    id: "table.addRow",
    execute: (context) => {
        const table = resolveTableFromContext(context);
        if (!table) return false;

        return addRowToTable(table);
    },
};