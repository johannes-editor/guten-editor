/** @jsx h */

import { h } from "@core/jsx/index.ts";
import { t } from "@core/i18n/index.ts";
import { runCommand } from "@core/command/index.ts";
import { TextColorIcon } from "@components/ui/primitives/icons.tsx"
import { FormattingToolbarExtensionPlugin } from "@plugin/formatting-toolbar/index.ts";

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