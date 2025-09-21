/** @jsx h */

import { Command } from "../../../core/command/command.ts";
import { h, appendElementOnOverlayArea, runCommand } from "../../index.ts";
import { EquationPlaceholder } from "../components/equation-placeholder.tsx";
import { EquationPopover } from "../components/equation-popover.tsx";


type OpenEquationPopoverContext = {
    targetEquation?: HTMLElement | null;
    latex?: string;
    displayMode?: boolean;
};

/**
 * Command: opens the Equation (KaTeX) popover overlay.
 *
 * - Appends a UI that lets the user enter LaTeX (and toggle display mode).
 * - Typically followed by `insertEquation`, triggered from the popover.
 * @returns {boolean} Always true after appending the overlay.
 */
export const OpenEquationPopover: Command<OpenEquationPopoverContext> = {
    id: "openEquationPopover",
    // shortcut: { chord: "Mod+Shift+E", description: "Insert/edit equation", preventDefault: true },
    execute(context): boolean {
        const { targetEquation, latex, displayMode } = context?.content ?? {};

        appendElementOnOverlayArea(
            <EquationPopover
                title="Equation"
                inputType="text"
                inputPlaceholder="Write LaTeX (e.g. \\frac{a}{b})"
                targetEquation={targetEquation ?? undefined}
                initialLatex={latex}
                initialDisplayMode={displayMode}
            />
        );

        return true;
    }
};