import { Command } from "@core/command";
import { CommandExtensionPlugin } from "@plugin/commands";
import { SelectBlockContent } from "../commands/select-block-content.ts";

export class BlockSelectionCommandExtension extends CommandExtensionPlugin {
    override commands(): Command | Command[] {
        return SelectBlockContent;
    }
}