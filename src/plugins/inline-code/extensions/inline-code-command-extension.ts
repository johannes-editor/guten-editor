import { Command } from "@core/command";
import { CommandExtensionPlugin } from "@plugin/commands";
import { StateInlineCode } from "../commands/state-inline-code.ts";
import { ToggleInlineCode } from "../commands/toggle-inline-code.ts";


export class InlineCodeCommandExtension extends CommandExtensionPlugin {

    override commands(): Command | Command[] {
        return [StateInlineCode, ToggleInlineCode];
    }
}