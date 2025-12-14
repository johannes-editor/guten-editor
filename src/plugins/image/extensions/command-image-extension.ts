import { CommandExtensionPlugin } from "../../commands/command-plugin.ts";
import { Command } from "../../index.ts";
import { InsertImageBlockCommand } from "../commands/insert-image-block-command.tsx";
import { InsertImage } from "../commands/insert-image.tsx";
import { OpenImageMenu } from "../commands/open-image-menu.tsx";
import { ReplaceImage } from "../commands/replace-image.tsx";

export class CommandImageExtension extends CommandExtensionPlugin {

    override commands(): Command | Command[] {
        return [InsertImageBlockCommand, OpenImageMenu, InsertImage, ReplaceImage];
    }
}