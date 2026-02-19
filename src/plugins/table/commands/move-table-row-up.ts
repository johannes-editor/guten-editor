import { Command } from "@core/command";
import { moveRowOnTable, resolveTableFromContext } from "./table-command-utils.ts";

export const MoveTableRowUpCommand: Command = {
    id: "table.moveRowUp",
    execute: (context) => {
        const table = resolveTableFromContext(context);
        if (!table) return false;

        return moveRowOnTable(table, context, "up");
    },
};