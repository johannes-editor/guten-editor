import { Command } from "@core/command";
import { CommandExtensionPlugin } from "@plugin/commands";
import { InsertYouTubeEmbed } from "../commands/insert-youtube-embed.tsx";
import { OpenYouTubePopover } from "../commands/open-youtube-popover.tsx";


export class CommandYouTubeExtensionPlugin extends CommandExtensionPlugin {
    override commands(): Command | Command[] {
        return [OpenYouTubePopover, InsertYouTubeEmbed];
    }
}