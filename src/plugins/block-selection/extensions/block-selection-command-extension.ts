import { CommandExtensionPlugin } from "../../commands/command-plugin.ts";
import { Command } from "../../index.ts";
import { SelectBlockContent } from "../commands/select-block-content.ts";

export class BlockSelectionCommandExtension extends CommandExtensionPlugin {
    override commands(): Command | Command[] {
        return SelectBlockContent;
    }
}