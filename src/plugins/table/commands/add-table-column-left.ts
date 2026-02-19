import { Command } from "@core/command";
import { addColumnRelativeToTable, resolveTableFromContext } from "./table-command-utils.ts";

export const AddTableColumnLeftCommand: Command = {
    id: "table.addColumnLeft",
    execute: (context) => {
        const table = resolveTableFromContext(context);
        if (!table) return false;

        return addColumnRelativeToTable(table, context, "left");
    },
};