import { t } from "@core/i18n";
import { runCommand } from "@core/command";
import { TextColorIcon } from "@components/ui/icons"
import { FormattingToolbarExtensionPlugin } from "@plugins/formatting-toolbar";

/**
 * FormattingToolbar extension that adds the "Text Color" button.
 * Clicking the button triggers the `openTextColorMenu` command, which opens
 * a menu allowing users to set text and highlight colors.
 */
export class FormattingToolbarTextColorExtension extends FormattingToolbarExtensionPlugin {
    /** Toolbar icon (link glyph). */
    readonly icon: SVGElement = <TextColorIcon />;

    /** Tooltip shown on hover. */
    readonly label: string = t("text_color");

    readonly shortcut: string = "";

    /** Indicates this button opens an overlay instead of applying formatting immediately. */
    override readonly showMenuIndicator: boolean = true;

    /** Sort order within the toolbar (lower = earlier). */
    readonly sort: number = 50;

    override onSelect(event?: Event, button?: HTMLButtonElement | null): void {
        runCommand("openTextColorMenu", {
            event,
            target: button ?? undefined,
            content: { anchor: button ?? undefined },
        });
    }
}