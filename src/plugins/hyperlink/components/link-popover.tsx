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
 *   with the provided URL.
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
    }

    /** Reads the URL and issues the `createLink` command. */
    handleInsert(): void {
        const url = this.input.value.trim() ?? '';

        // Restore selection before applying the link.
        useContext(this, FormattingToolbarCtx)?.unlock?.();

        this.remove();

        requestAnimationFrame(() => {

            if (!url) {
                return;
            }

            //
            //TODO validation
            // try { new URL(url); } catch { alert('URL inválida: ' + url); return; }
            runCommand('createLink', { url, target: this.props.formattingToolbar });
        });
    }
}