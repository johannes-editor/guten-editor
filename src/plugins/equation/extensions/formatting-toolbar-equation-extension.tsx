/** @jsx h */

import { h } from "@core/jsx/index.ts";
import { t } from "@core/i18n/index.ts";
import { runCommand } from "@core/command/index.ts";
import { EquationIcon } from "@components/ui/primitives/icons.tsx";
import { FormattingToolbarExtensionPlugin } from "@plugin/formatting-toolbar/formatting-toolbar-plugin.tsx";

/**
 * FormattingToolbar extension that adds the "Insert Math (KaTeX)" button.
 * When clicked, it triggers the `openEquationPopover` command to insert equations.
 */
export class FormattingToolbarEquationExtension extends FormattingToolbarExtensionPlugin {
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