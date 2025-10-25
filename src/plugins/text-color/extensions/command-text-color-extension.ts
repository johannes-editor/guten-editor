import { Command, CommandExtensionPlugin } from "../../index.ts";
import { OpenTextColorMenu } from "../commands/open-text-color-menu.tsx";
import { SetHighlightColor } from "../commands/set-highlight-color.ts";
import { SetTextColor } from "../commands/set-text-color.ts";

/**
 * Command extension that registers text-color–related commands.
 *
 * Registers:
 *  - OpenTextColorMenu — Opens the text color menu.
 *  - SetHighlightColor — Sets the highlight color of the selected text.
 *  - SetTextColor — Sets the text (foreground) color of the selected text.
 */
export class CommandTextColorExtension extends CommandExtensionPlugin {

    /** Returns the commands provided by this extension. */
    override commands(): Command | Command[] {
        return [OpenTextColorMenu, SetHighlightColor, SetTextColor];
    }
}