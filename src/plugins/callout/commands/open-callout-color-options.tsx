/** @jsx h */
import { h } from "../../index.ts";
import { Command, CommandContext } from "../../../core/command/command.ts";
import { appendElementOnOverlayArea, selection } from "../../index.ts";
import { CalloutColorMenu } from "../components/callout-color-menu.tsx";

export const OpenBlockOptions: Command = {
    id: "openCalloutColorOptions",
    shortcut: { chord: "Mod+Shift+G", description: "Open block options" },

    execute(context: CommandContext<{ block: HTMLElement; anchor: HTMLElement }>): boolean {
        appendElementOnOverlayArea(
            <CalloutColorMenu
                block={context.content?.block ?? selection.findClosestBlockBySelection()!}
                anchor={context.content?.anchor!}
            />
        );

        return true;
    }
};