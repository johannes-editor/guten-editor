import { Command } from "@core/command";
import { addRowRelativeToTable, resolveTableFromContext } from "./table-command-utils.ts";

export const AddTableRowBelowCommand: Command = {
    id: "table.addRowBelow",
    execute: (context) => {
        const table = resolveTableFromContext(context);
        if (!table) return false;

        return addRowRelativeToTable(table, context, "below");
    },
};