import { Command } from "@core/command";
import { addColumnRelativeToTable, resolveTableFromContext } from "./table-command-utils.ts";

export const AddTableColumnRightCommand: Command = {
    id: "table.addColumnRight",
    execute: (context) => {
        const table = resolveTableFromContext(context);
        if (!table) return false;

        return addColumnRelativeToTable(table, context, "right");
    },
};