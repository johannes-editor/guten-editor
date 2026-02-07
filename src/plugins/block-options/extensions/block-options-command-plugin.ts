import { Command } from "@/core/command/command.ts";
import { CommandExtensionPlugin } from "@plugin/commands/command-plugin.ts";
import { DeleteBlock } from "../commands/delete-block.ts";
import { DuplicateBlock } from "../commands/duplicate-block.tsx";
import { MoveBlockDown } from "../commands/move-block-down.ts";
import { MoveBlockUp } from "../commands/move-block-up.ts";
import { OpenBlockOptions } from "../commands/open-block-options.tsx";

export class BlockOptionsCommandPlugin extends CommandExtensionPlugin {
    override commands(): Command | Command[] {
        return [OpenBlockOptions, DuplicateBlock, MoveBlockUp, MoveBlockDown, DeleteBlock];
    }
}