import { CommandExtensionPlugin } from "../commands/command-plugin.ts";
import { Command } from "../index.ts";
import { OpenEmojiPicker } from "./commands/open-emoji-picker.tsx";

export class CommandEmojiExtension extends CommandExtensionPlugin {

    override commands(): Command | Command[] {
        return [OpenEmojiPicker];
    }
}
