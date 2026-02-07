/** @jsx h */

import { h } from "@core/jsx/index.ts";
import { Command, CommandContext } from "@core/command/command.ts";
import { appendElementOnOverlayArea } from "@components/editor/core/index.tsx";
import { findClosestBlockBySelection } from "@utils/selection/index.ts";
import { CalloutColorMenu } from "../components/callout-color-menu.tsx";

export const OpenCalloutBlockOptions: Command = {
    id: "openCalloutColorOptions",
    shortcut: { chord: "Mod+Shift+G", description: "Open callout block options" },

    execute(context: CommandContext<{ block: HTMLElement; anchor: HTMLElement }>): boolean {
        appendElementOnOverlayArea(
            <CalloutColorMenu
                block={context.content?.block ?? findClosestBlockBySelection()!}
                anchor={context.content?.anchor!}
            />
        );

        return true;
    }
};