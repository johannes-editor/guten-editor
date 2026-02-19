import { Command } from "@core/command";
import { CommandExtensionPlugin } from "@plugins/commands";
import { AddTableColumnCommand } from "../commands/add-table-column.ts";
import { AddTableRowCommand } from "../commands/add-table-row.ts";
import { DeleteTableColumnCommand } from "../commands/delete-table-column.ts";
import { DeleteTableRowCommand } from "../commands/delete-table-row.ts";
import { OpenTableRowOptionsCommand } from "../commands/open-table-row-options.tsx";
import { OpenTableColumnOptionsCommand } from "../commands/open-table-column-options.tsx";
import { AddTableRowAboveCommand } from "../commands/add-table-row-above.ts";
import { AddTableRowBelowCommand } from "../commands/add-table-row-below.ts";
import { MoveTableRowUpCommand } from "../commands/move-table-row-up.ts";
import { MoveTableRowDownCommand } from "../commands/move-table-row-down.ts";
import { AddTableColumnLeftCommand } from "../commands/add-table-column-left.ts";
import { AddTableColumnRightCommand } from "../commands/add-table-column-right.ts";
import { MoveTableColumnLeftCommand } from "../commands/move-table-column-left.ts";
import { MoveTableColumnRightCommand } from "../commands/move-table-column-right.ts";

export class TableCommandExtension extends CommandExtensionPlugin {

    override commands(): Command | Command[] {
        return [
            AddTableRowCommand,
            AddTableRowAboveCommand,
            AddTableRowBelowCommand,
            AddTableColumnCommand,
            AddTableColumnLeftCommand,
            AddTableColumnRightCommand,
            DeleteTableRowCommand,
            DeleteTableColumnCommand,
            MoveTableRowUpCommand,
            MoveTableRowDownCommand,
            MoveTableColumnLeftCommand,
            MoveTableColumnRightCommand,
            OpenTableRowOptionsCommand,
            OpenTableColumnOptionsCommand,
        ];
    }
}