import { Command } from "@core/command/index.ts";
import { CommandExtensionPlugin } from "@plugin/commands/command-plugin.ts";
import { OpenEmojiPicker } from "./commands/open-emoji-picker.tsx";

export class CommandEmojiExtension extends CommandExtensionPlugin {

    override commands(): Command | Command[] {
        return [OpenEmojiPicker];
    }
}
