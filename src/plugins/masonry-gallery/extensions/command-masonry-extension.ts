import { Command } from "@core/command";
import { CommandExtensionPlugin } from "@plugins/commands";
import { InsertMasonryImage } from "../commands/insert-masonry-image.ts";
import { OpenMasonryImageMenu } from "../commands/open-masonry-image-menu.tsx";

export class CommandMasonryExtension extends CommandExtensionPlugin {

    override commands(): Command | Command[] {
        return [InsertMasonryImage, OpenMasonryImageMenu];
    }
}