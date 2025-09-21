/** @jsx h */

import { h } from "../../jsx.ts";
import { runCommand, t } from "../index.ts";
import { FormattingToolbarExtensionPlugin } from "../formatting-toolbar/formatting-toolbar-plugin.tsx";
import { EquationIcon } from "../../design-system/components/icons.tsx";

/**
 * FormattingToolbar extension that adds the "Insert Math (KaTeX)" button.
 * When clicked, it triggers the `openEquationPopover` command to insert equations.
 */
export class FormattingToolbarEquationButtonExtensionPlugin extends FormattingToolbarExtensionPlugin {
    /** Toolbar icon (equation glyph). */
    readonly icon: SVGElement = <EquationIcon />;

    /** Tooltip shown on hover. */
    readonly label: string = t("equation");

    readonly shortcut: string = "Mod+Shift+E";

    /** Sort order within the toolbar (higher = later). */
    readonly sort: number = 60;

    /** Invoked on button click: opens the math popover. */
    onSelect(): void {
        runCommand("openEquationPopover");
    }
}