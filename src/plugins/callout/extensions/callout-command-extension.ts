import { CommandExtensionPlugin } from "../../commands/command-plugin.ts";
import { Command } from "../../index.ts";
import { InsertCalloutCommand } from "../commands/insert-callout-commands.tsx";
import { OpenBlockOptions } from "../commands/open-callout-color-options.tsx";


export class CalloutCommandExtension extends CommandExtensionPlugin {
    override commands(): Command | Command[] {
        return [OpenBlockOptions, InsertCalloutCommand];
    }
}