
import { Command } from "@core/command";
import { CommandExtensionPlugin } from "@plugin/commands";
import { SlashMenuCommands } from "../commands/insert-block-commands.tsx";

export class SlashMenuCommandExtension extends CommandExtensionPlugin {
    override commands(): Command | Command[] {
        return SlashMenuCommands;
    }
}