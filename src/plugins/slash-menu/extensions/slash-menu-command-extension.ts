import { Command, CommandExtensionPlugin } from "../../index.ts";
import { SlashMenuCommands } from "../commands/insert-block-commands.tsx";

export class SlashMenuCommandExtension extends CommandExtensionPlugin {
    override commands(): Command | Command[] {
        return SlashMenuCommands;
    }
}