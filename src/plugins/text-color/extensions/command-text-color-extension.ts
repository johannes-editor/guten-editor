import { Command, CommandExtensionPlugin } from "../../index.ts";
import { OpenTextColorMenu } from "../commands/open-text-color-menu.tsx";
import { SetHighlightColor } from "../commands/set-highlight-color.ts";
import { SetTextColor } from "../commands/set-text-color.ts";

/**
 * Command extension that registers text color–related commands.
 *
 * Provides:
 *  - OpenTextColorMenu — Opens the text color menu overlay.
 *  - SetTextColor — Applies a foreground (text) color to the current selection.
 *  - SetHighlightColor — Applies a background (highlight) color to the current selection.
 */
export class CommandTextColorExtension extends CommandExtensionPlugin {

    /** Returns the commands provided by this extension. */
    override commands(): Command | Command[] {
        return [OpenTextColorMenu, SetHighlightColor, SetTextColor];
    }
}