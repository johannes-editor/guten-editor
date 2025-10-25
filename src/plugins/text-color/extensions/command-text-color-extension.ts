import { Command, CommandExtensionPlugin } from "../../index.ts";
import { OpenTextColorMenu } from "../commands/open-text-color-menu.tsx";

/**
 * Command extension that registers text color related commands.
 *
 * Registers:
 *  - OpenTextColorMenu — shows the TextColor menu.
 */
export class CommandTextColorExtension extends CommandExtensionPlugin {

    /** Returns the commands contributed by this extension. */
    override commands(): Command | Command[] {
        return [OpenTextColorMenu];
    }
}