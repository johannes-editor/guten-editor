import { Command } from "@core/command/index.ts";
import { addColumnToTable, resolveTableFromContext } from "./table-command-utils.ts";

export const AddTableColumnCommand: Command = {
    id: "table.addColumn",
    execute: (context) => {
        const table = resolveTableFromContext(context);
        if (!table) return false;

        return addColumnToTable(table);
    },
};