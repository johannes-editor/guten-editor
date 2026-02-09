import { Command } from "@core/command";
import { CommandExtensionPlugin } from "@plugins/commands";
import { InsertCalloutCommand } from "../commands/insert-callout-commands.tsx";
import { OpenCalloutBlockOptions } from "../commands/open-callout-color-options.tsx";

export class CalloutCommandExtension extends CommandExtensionPlugin {
    override commands(): Command | Command[] {
        return [OpenCalloutBlockOptions, InsertCalloutCommand];
    }
}