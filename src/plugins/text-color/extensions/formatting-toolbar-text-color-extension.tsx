/** @jsx h */

import { FormattingToolbarExtensionPlugin, icons, runCommand, t, h } from "../../index.ts";


/**
 * FormattingToolbar extension that adds the "Insert Link" button.
 * Clicking the button triggers the `openLinkPopover` command.
 */
export class FormattingToolbarTextColorExtension extends FormattingToolbarExtensionPlugin {
    /** Toolbar icon (link glyph). */
    readonly icon: SVGElement = <icons.TextColorIcon />;

    /** Tooltip shown on hover. */
    readonly label: string = t("text_color");

    // readonly shortcut: string = "Mod+K";
    readonly shortcut: string = "";

    /** Indicates this button opens an overlay instead of applying formatting immediately. */
    override readonly showMenuIndicator: boolean = true;

    /** Sort order within the toolbar (lower = earlier). */
    readonly sort: number = 50;

    /** Invoked on button click: opens the link popover. */
    // onSelect(): void {
    //     console.log("openTextColorMenu executado")
    //     runCommand("openTextColorMenu");
    // }

    override onSelect(event?: Event, button?: HTMLButtonElement | null): void {
        runCommand("openTextColorMenu", {
            event,
            target: button ?? undefined,
            content: { anchor: button ?? undefined },
        });
    }
}