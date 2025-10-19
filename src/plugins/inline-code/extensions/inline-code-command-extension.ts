import { CommandExtensionPlugin } from "../../commands/command-plugin.ts";
import { Command } from "../../index.ts";
import { StateInlineCode } from "../commands/state-inline-code.ts";
import { ToggleInlineCode } from "../commands/toggle-inline-code.ts";


export class InlineCodeCommandExtension extends CommandExtensionPlugin {

    override commands(): Command | Command[] {
        return [StateInlineCode, ToggleInlineCode];
    }
}