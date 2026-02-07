/** @jsx h */

import { h } from "@core/jsx/index.ts";
import { t } from "@core/i18n/index.ts";
import { runCommand } from "@core/command/index.ts";
import { LinkIcon } from "@components/ui/primitives/icons.tsx";
import { FormattingToolbarExtensionPlugin } from "@plugin/formatting-toolbar/index.ts";

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

    /** Indicates this button opens an overlay instead of applying formatting immediately. */
    override readonly showMenuIndicator: boolean = true;

    /** Sort order within the toolbar (lower = earlier). */
    readonly sort: number = 80;

    /** Invoked on button click: opens the link popover. */
    onSelect(): void {
        runCommand("openLinkPopover");
    }
}