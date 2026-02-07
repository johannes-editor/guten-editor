import { Command } from "@core/command/index.ts";
import { CommandExtensionPlugin } from "@plugin/commands/command-plugin.ts";
import { InsertCodeBlockCommand } from "../commands/insert-code-command.tsx";

export class CodeCommandExtension extends CommandExtensionPlugin {
    override commands(): Command | Command[] {
        return [InsertCodeBlockCommand];
    }
}