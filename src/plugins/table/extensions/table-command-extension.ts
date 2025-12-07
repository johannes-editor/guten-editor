import { Command, CommandExtensionPlugin } from "../../index.ts";
import { AddTableColumnCommand } from "../commands/add-table-column.ts";
import { AddTableRowCommand } from "../commands/add-table-row.ts";

export class TableCommandExtension extends CommandExtensionPlugin {

    override commands(): Command | Command[] {
        return [AddTableRowCommand, AddTableColumnCommand];
    }
}