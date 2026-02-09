import { Command } from "@core/command";
import { CommandExtensionPlugin } from "@plugins/commands";
import { OpenEmojiPicker } from "./commands/open-emoji-picker.tsx";

export class CommandEmojiExtension extends CommandExtensionPlugin {

    override commands(): Command | Command[] {
        return [OpenEmojiPicker];
    }
}
