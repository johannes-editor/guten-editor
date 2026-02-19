import { Command } from "@core/command";
import { moveColumnOnTable, resolveTableFromContext } from "./table-command-utils.ts";

export const MoveTableColumnRightCommand: Command = {
    id: "table.moveColumnRight",
    execute: (context) => {
        const table = resolveTableFromContext(context);
        if (!table) return false;

        return moveColumnOnTable(table, context, "right");
    },
};