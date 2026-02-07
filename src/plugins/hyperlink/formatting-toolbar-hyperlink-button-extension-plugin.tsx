import { t } from "@core/i18n";
import { runCommand } from "@core/command";
import { LinkIcon } from "@components/ui/icons";
import { FormattingToolbarExtensionPlugin } from "@plugin/formatting-toolbar";

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