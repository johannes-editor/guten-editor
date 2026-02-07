import { Command } from "@core/command/command.ts";
import { CommandExtensionPlugin } from "@plugin/commands/command-plugin.ts";
import { InsertYouTubeEmbed } from "../commands/insert-youtube-embed.tsx";
import { OpenYouTubePopover } from "../commands/open-youtube-popove.tsx";


export class CommandYouTubeExtensionPlugin extends CommandExtensionPlugin {
    override commands(): Command | Command[] {
        return [OpenYouTubePopover, InsertYouTubeEmbed];
    }
}