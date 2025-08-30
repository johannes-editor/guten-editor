/** @jsx h */

import { h } from "../../jsx.ts";
import { LinkIcon } from "../../design-system/components/icons.tsx";
import { FormattingToolbarExtensionPlugin } from "../formatting-toolbar/formatting-toolbar-plugin.tsx";
import { runCommand, t } from "../index.ts";

/**
 * FormattingToolbar extension that adds the "Insert Link" button.
 * Clicking the button triggers the `openLinkPopover` command.
 */
export class FormattingToolbarHyperlinkButtonExtensionPlugin extends FormattingToolbarExtensionPlugin {
     /** Toolbar icon (link glyph). */
    readonly icon: SVGElement = <LinkIcon />;

    /** Tooltip shown on hover. */
    readonly label: string = t("link");

    readonly shortcut: string = "Mod+K";

    /** Sort order within the toolbar (lower = earlier). */
    readonly sort: number = 50;

    /** Invoked on button click: opens the link popover. */
    onSelect(): void {
        runCommand("openLinkPopover");
    }
}