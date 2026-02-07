/** @jsx h */

import { runCommand } from "@core/command/index.ts";
import { useContext } from "@core/context/context.ts";
import { InputPopover, InputPopoverProps, SelectionController } from "@components/ui/composites/input/input-popover.ts";
import { OverlayCtor } from "@components/editor/overlay/overlay-component.tsx";
import { FormattingToolbar, FormattingToolbarCtx } from "@plugin/formatting-toolbar/index.ts";

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

    override canOverlayClasses: ReadonlySet<OverlayCtor> = new Set<OverlayCtor>([FormattingToolbar]);

    private existingAnchor: HTMLAnchorElement | null = null;

    /** Inject selection lock/unlock from the formatting toolbar (if available). */
    override onMount(): void {

        const formattingToolbar = useContext(this, FormattingToolbarCtx);

        if (formattingToolbar) {

            const selectionCtrl: SelectionController = {
                lock: () => formattingToolbar.lock(),
                unlock: () => formattingToolbar.unlock(),
            };

            (this.props as InputPopoverProps).selectionController = selectionCtrl;

            const rect = formattingToolbar.getSelectionRect?.();
            if (rect) {
                this.setPosition(rect);
            }
        }

        const selection = globalThis.getSelection();
        if (selection?.anchorNode) {
            const anchor = (selection.anchorNode instanceof Element ? selection.anchorNode : selection.anchorNode.parentElement)?.closest("a") as HTMLAnchorElement | null;
            if (anchor) {
                this.existingAnchor = anchor;
                this.input.value = anchor.getAttribute("href") ?? "";
            }
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
            if (href) {
                runCommand('createLink', { content: { href } });
            } else if (this.existingAnchor) {
                runCommand('removeLink');
            }
        });
    }
}