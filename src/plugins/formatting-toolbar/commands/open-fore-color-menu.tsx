/** @jsx h */
import { Command } from "../../../core/command/command.ts";
import { h, appendElementOnOverlayArea, hasSelection } from "../../index.ts";
import { FormattingToolbarForeColorMenu } from "../component/formatting-toolbar-fore-color-menu.tsx";
import { COLOR_TOOLBAR_ITEM_ID } from "../component/constants.ts";

type OpenColorMenuPayload = {
    anchor?: HTMLElement | null;
};

export const OpenFormattingToolbarForeColorMenu: Command<OpenColorMenuPayload> = {
    id: "openFormattingToolbarForeColorMenu",
    execute(context) {
        if (!hasSelection()) return false;

        const anchor = context?.content?.anchor
            ?? (context?.target instanceof HTMLElement ? context.target : null)
            ?? document.querySelector<HTMLElement>(`[data-toolbar-item="${COLOR_TOOLBAR_ITEM_ID}"]`);

        appendElementOnOverlayArea(<FormattingToolbarForeColorMenu anchor={anchor ?? undefined} />);
        return true;
    },
};