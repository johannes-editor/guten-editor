import { Command } from "@core/command";
import { moveColumnOnTable, resolveTableFromContext } from "./table-command-utils.ts";

export const MoveTableColumnLeftCommand: Command = {
    id: "table.moveColumnLeft",
    execute: (context) => {
        const table = resolveTableFromContext(context);
        if (!table) return false;

        return moveColumnOnTable(table, context, "left");
    },
};