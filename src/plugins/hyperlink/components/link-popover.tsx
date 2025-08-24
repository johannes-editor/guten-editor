/** @jsx h */

import { InputPopover, InputPopoverProps, SelectionController } from "../../../components/input-popover/input-popover.ts";
import { useContext } from "../../../core/context/context.ts";
import { FormattingToolbarCtx } from "../../formatting-toolbar/formatting-toolbar-context.ts";
import { runCommand } from "../../index.ts";

/**
 * UI popover for inserting hyperlinks.
 *
 * Behavior:
 * - On mount, wires a SelectionController from {@link FormattingToolbarCtx}
 *   to lock/unlock the selection while the popover is open.
 * - On insert, restores the selection, closes itself, and runs `createLink`
 *   with the provided `href` via the command content payload.
 */
export class LinkPopover extends InputPopover<InputPopoverProps> {

    /** Inject selection lock/unlock from the formatting toolbar (if available). */
    override onMount(): void {

        const formattingToolbar = useContext(this, FormattingToolbarCtx);

        if (formattingToolbar) {

            const selectionCtrl: SelectionController = {
                lock: () => formattingToolbar.lock(),
                unlock: () => formattingToolbar.unlock(),
            };

            (this.props as InputPopoverProps).selectionController = selectionCtrl;
        }

        requestAnimationFrame(() => {
            this.input.focus();
            // move caret to the end
            this.input.setSelectionRange(this.input.value.length, this.input.value.length);
        });
    }

    /** Reads the `href` and issues the `createLink` command with `content: { href }`. */
    handleInsert(): void {
        const href = this.input.value.trim() ?? '';

        // Restore selection before applying the link.
        useContext(this, FormattingToolbarCtx)?.unlock?.();

        this.remove();

        requestAnimationFrame(() => {

            if (!href) return;

            runCommand('createLink', { content: { href } });
        });
    }
}