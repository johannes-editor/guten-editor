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

    private targetEquation: HTMLElement | null = null;

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

        const sel = globalThis.getSelection();
        const range = sel?.rangeCount ? sel.getRangeAt(0) : null;

        const startNode = (range?.startContainer ?? sel?.anchorNode) as Node | null;
        const startEl = startNode instanceof Element ? startNode : startNode?.parentElement ?? null;

        const mathLike = startEl?.closest('[data-latex], .math-inline, .math-block, .katex, .katex-display') as HTMLElement | null;

        const eqWrapper =
            (mathLike?.closest('[data-latex], .math-inline, .math-block') as HTMLElement | null) ?? mathLike ?? null;

        if (eqWrapper) {
            this.targetEquation = eqWrapper;

            let latex =
                eqWrapper.getAttribute('data-latex')?.trim() ??
                '';

            if (!latex) {
                const ann = eqWrapper.querySelector('annotation[encoding="application/x-tex"]') as HTMLElement | null;
                latex = ann?.textContent?.trim() ?? '';
            }

            this.input.value = latex;
            this.displayMode =
                eqWrapper.classList.contains('math-block') ||
                mathLike?.classList.contains('katex-display') === true;
        } else {
            const text = sel?.toString();
            if (text) this.input.value = text;
        }

        requestAnimationFrame(() => {
            this.input.focus();
            this.input.setSelectionRange(this.input.value.length, this.input.value.length);
        });
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
            if (latex) {
                runCommand("insertEquation", {
                    content: {
                        latex: latex,
                        displayMode: this.displayMode
                    }
                });
            } else if (this.targetEquation) {
                this.targetEquation.remove();
            } else {
                const sel = globalThis.getSelection();
                if (sel && sel.rangeCount > 0) sel.getRangeAt(0).deleteContents();
            }
        });
    }
}
