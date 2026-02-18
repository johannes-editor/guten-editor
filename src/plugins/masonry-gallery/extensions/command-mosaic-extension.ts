import { Command } from "@core/command";
import { CommandExtensionPlugin } from "@plugins/commands";
import { InsertMosaicImage } from "../commands/insert-mosaic-image.ts";
import { OpenMosaicImageMenu } from "../commands/open-mosaic-image-menu.tsx";

export class CommandMosaicExtension extends CommandExtensionPlugin {

    override commands(): Command | Command[] {
        return [InsertMosaicImage, OpenMosaicImageMenu];
    }
}