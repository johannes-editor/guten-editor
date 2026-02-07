import { Command } from "@core/command/index.ts";
import { CommandExtensionPlugin } from "@plugin/commands/command-plugin.ts";
import { SelectBlockContent } from "../commands/select-block-content.ts";

export class BlockSelectionCommandExtension extends CommandExtensionPlugin {
    override commands(): Command | Command[] {
        return SelectBlockContent;
    }
}