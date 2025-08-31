/** @jsx h */
import { h, appendElementOnOverlayArea } from "../index.ts";
import { Command, CommandContext } from "../../core/command/command.ts";
import { BlockOptions } from "./components/block-options.tsx";

export const OpenBlockOptions: Command = {
    id: "openBlockOptions",
    shortcut: { chord: "Mod+Shift+O", description: "Open block options" },
    execute(ctx: CommandContext<{ block?: HTMLElement; rect?: DOMRect }>): boolean {
        const el = appendElementOnOverlayArea(<BlockOptions />);
        const rect = ctx.content?.rect;
        if (rect) {
            el.style.top = `${rect.top}px`;
            el.style.left = `${rect.right + 8}px`;
        }
        return true;
    }
};
