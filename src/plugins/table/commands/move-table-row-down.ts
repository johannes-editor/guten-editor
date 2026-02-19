import { Command } from "@core/command";
import { moveRowOnTable, resolveTableFromContext } from "./table-command-utils.ts";

export const MoveTableRowDownCommand: Command = {
    id: "table.moveRowDown",
    execute: (context) => {
        const table = resolveTableFromContext(context);
        if (!table) return false;

        return moveRowOnTable(table, context, "down");
    },
};