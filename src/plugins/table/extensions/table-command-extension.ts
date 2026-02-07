import { Command } from "@core/command/index.ts";
import { CommandExtensionPlugin } from "@plugin/commands/index.ts";
import { AddTableColumnCommand } from "../commands/add-table-column.ts";
import { AddTableRowCommand } from "../commands/add-table-row.ts";
import { DeleteTableColumnCommand } from "../commands/delete-table-column.ts";
import { DeleteTableRowCommand } from "../commands/delete-table-row.ts";

export class TableCommandExtension extends CommandExtensionPlugin {

    override commands(): Command | Command[] {
        return [
            AddTableRowCommand,
            AddTableColumnCommand,
            DeleteTableRowCommand,
            DeleteTableColumnCommand,
        ];
    }
}