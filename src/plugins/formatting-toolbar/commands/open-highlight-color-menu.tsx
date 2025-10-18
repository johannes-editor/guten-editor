/** @jsx h */
import { Command } from "../../../core/command/command.ts";
import { h, appendElementOnOverlayArea, hasSelection } from "../../index.ts";
import { FormattingToolbarHighlightColorMenu } from "../component/formatting-toolbar-highlight-color-menu.tsx";
import { COLOR_TOOLBAR_ITEM_ID } from "../component/constants.ts";

type OpenColorMenuPayload = {
    anchor?: HTMLElement | null;
};

export const OpenFormattingToolbarHighlightColorMenu: Command<OpenColorMenuPayload> = {
    id: "openFormattingToolbarHighlightColorMenu",
    execute(context) {
        if (!hasSelection()) return false;

        const anchor = context?.content?.anchor
            ?? (context?.target instanceof HTMLElement ? context.target : null)
            ?? document.querySelector<HTMLElement>(`[data-toolbar-item="${COLOR_TOOLBAR_ITEM_ID}"]`);

        appendElementOnOverlayArea(<FormattingToolbarHighlightColorMenu anchor={anchor ?? undefined} />);
        return true;
    },
};