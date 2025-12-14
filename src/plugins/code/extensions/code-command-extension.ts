import { CommandExtensionPlugin } from "../../commands/command-plugin.ts";
import { Command } from "../../index.ts";
import { InsertCodeBlockCommand } from "../commands/insert-code-command.tsx";

export class CodeCommandExtension extends CommandExtensionPlugin {
    override commands(): Command | Command[] {
        return [InsertCodeBlockCommand];
    }
}