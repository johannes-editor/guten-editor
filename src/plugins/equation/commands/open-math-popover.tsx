/** @jsx h */

import { Command } from "../../../core/command/command.ts";
import { h, appendElementOnOverlayArea } from "../../index.ts";
import { EquationPopover } from "../components/equation-popover.tsx";

/**
 * Command: opens the Equation (KaTeX) popover overlay.
 *
 * - Appends a UI that lets the user enter LaTeX (and toggle display mode).
 * - Typically followed by `insertEquation`, triggered from the popover.
 * @returns {boolean} Always true after appending the overlay.
 */
export const OpenEquationPopover: Command = {
    id: "openEquationPopover",
    shortcut: { chord: "Mod+Shift+E", description: "Insert/edit equation", preventDefault: true },
    execute(): boolean {
        appendElementOnOverlayArea(
            <EquationPopover
                title="Equation"
                inputType="text"
                inputPlaceholder="Write LaTeX (e.g. \\frac{a}{b})"
            />
        );

        return true;
    }
};