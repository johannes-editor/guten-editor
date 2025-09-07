import { CommandExtensionPlugin } from "../commands/command-plugin.ts";
import { Command } from "../index.ts";
import { OpenBlockOptions } from "./commands/open-block-options.tsx";

export class BlockOptionsCommandPlugin extends CommandExtensionPlugin {
    override commands(): Command | Command[] {
        return OpenBlockOptions;
    }
}