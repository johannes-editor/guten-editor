import { Command } from "@core/command";
import { CommandExtensionPlugin } from "@plugin/commands";
import { StateBold, StateItalic, StateStrike, StateUnderline } from "./commands";
import { ToggleBold, ToggleItalic, ToggleStrike, ToggleUnderline } from "./commands";

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
            StateUnderline
        ];
    }
}