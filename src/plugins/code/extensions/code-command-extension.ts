import { Command } from "@core/command";
import { CommandExtensionPlugin } from "@plugins/commands";
import { InsertCodeBlockCommand } from "../commands/insert-code-command.tsx";

export class CodeCommandExtension extends CommandExtensionPlugin {
    override commands(): Command | Command[] {
        return [InsertCodeBlockCommand];
    }
}