import { CommandExtensionPlugin } from "../../commands/command-plugin.ts";
import { Command } from "../../index.ts";
import { InsertImage } from "../commands/insert-image.tsx";
import { OpenImageMenu } from "../commands/open-image-menu.tsx";
import { ReplaceImage } from "../commands/replace-image.tsx";

export class CommandImageExtension extends CommandExtensionPlugin {

    override commands(): Command | Command[] {
        return [OpenImageMenu, InsertImage, ReplaceImage];
    }
}