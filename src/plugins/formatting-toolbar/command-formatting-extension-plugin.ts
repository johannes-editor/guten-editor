/** @jsx h */

import { Command } from "../index.ts";
import { CommandExtensionPlugin } from "../commands/command-plugin.ts";
import { StateBold } from "./commands/state-bold.ts";
import { StateItalic } from "./commands/state-italic.ts";
import { StateStrike } from "./commands/state-strike.ts";
import { StateUnderline } from "./commands/state-underline.ts";
import { ToggleBold } from "./commands/toggle-bold.ts";
import { ToggleItalic } from "./commands/toggle-italic.ts";
import { ToggleStrike } from "./commands/toggle-strike.ts";
import { ToggleUnderline } from "./commands/toggle-underline.ts";
import { OpenFormattingToolbarForeColorMenu } from "./commands/open-fore-color-menu.tsx";
import { OpenFormattingToolbarHighlightColorMenu } from "./commands/open-highlight-color-menu.tsx";
import { SetHighlightColor } from "./commands/set-highlight-color.ts";
import { SetTextColor } from "./commands/set-text-color.ts";

export class CommandFormattingExtensionPlugin extends CommandExtensionPlugin {

    override commands(): Command | Command[] {
        return [
            ToggleBold, 
            ToggleItalic, 
            ToggleStrike, 
            ToggleUnderline, 
            StateBold, 
            StateItalic, 
            StateStrike, 
            StateUnderline,
            OpenFormattingToolbarForeColorMenu,
            OpenFormattingToolbarHighlightColorMenu,
            SetHighlightColor,
            SetTextColor
        ];
    }
}