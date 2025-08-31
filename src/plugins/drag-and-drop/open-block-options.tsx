/** @jsx h */
import { h, appendElementOnOverlayArea } from "../index.ts";
import { Command, CommandContext } from "../../core/command/command.ts";
import { BlockOptions } from "./components/block-options.tsx";

export const OpenBlockOptions: Command = {
    id: "openBlockOptions",
    shortcut: { chord: "Mod+Shift+O", description: "Open block options" },
    execute(_ctx: CommandContext<{ block?: HTMLElement }>): boolean {
        appendElementOnOverlayArea(<BlockOptions />);
        return true;
    }
};
