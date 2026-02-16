import { Command } from "@core/command";
import { CommandExtensionPlugin } from "@plugins/commands";
import { DeleteFocusedObjectCommand } from "../commands/delete-focused-object.ts";

export class CommandObjectDeletionExtension extends CommandExtensionPlugin {
    override commands(): Command | Command[] {
        return DeleteFocusedObjectCommand;
    }
}