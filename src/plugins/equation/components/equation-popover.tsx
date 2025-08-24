/** @jsx h */

import { runCommand } from "../../index.ts";
import { InputPopover, InputPopoverProps, SelectionController } from "../../../components/input-popover/input-popover.ts";
import { useContext } from "../../../core/context/context.ts";
import { FormattingToolbarCtx } from "../../formatting-toolbar/formatting-toolbar-context.ts";

/**
 * UI popover for entering an equation (LaTeX) and inserting it via KaTeX.
 *
 * Behavior:
 * - On mount, consumes {@link FormattingToolbarCtx} to wire a SelectionController
 *   that locks/unlocks the user selection while the popover is open.
 * - Tracks a local `displayMode` (inline vs. block).
 * - On insert, closes the popover, unlocks selection, and runs the
 *   `insertEquation` command with `{ latex, displayMode }`.
 */
export class EquationPopover extends InputPopover<InputPopoverProps> {

    /** Whether to render as display (block) math. */
    private displayMode = false;

    /** Inject a selection controller from the formatting toolbar context (if available). */
    override onMount(): void {
        const formattingToolbar = useContext(this, FormattingToolbarCtx);

        if (formattingToolbar) {
            const selectionCtrl: SelectionController = {
                lock: () => formattingToolbar.lock(),
                unlock: () => formattingToolbar.unlock(),
            };

            (this.props as InputPopoverProps).selectionController = selectionCtrl;
        }
    }

    /** Checkbox handler: toggles display mode. */
    private handleToggle = (ev: Event) => {
        this.displayMode = (ev.target as HTMLInputElement)?.checked ?? false;
    };

    /**
    * Reads LaTeX from the input, unlocks selection, closes the popover,
    * and dispatches the `insertEquation` command with current options.
    */
    override handleInsert(): void {
        const latex = this.input.value.trim() ?? '';

        // Ensure selection is restored before inserting content.
        useContext(this, FormattingToolbarCtx)?.unlock?.();

        this.remove();

        requestAnimationFrame(() => {
            runCommand("insertEquation", {
                latex,
                displayMode: this.displayMode,
            });
        });
    }
}
