/** @jsx h */
import { Command } from "../../../core/command/command.ts";
import { h, appendElementOnOverlayArea, hasSelection } from "../../index.ts";
import { TextColorMenu } from "../components/text-color-menu.tsx";

type OpenColorMenuPayload = {
    anchor?: HTMLElement | null;
};

export const OpenTextColorMenu: Command<OpenColorMenuPayload> = {
    id: "openTextColorMenu",
    execute(context) {
        if (!hasSelection()) return false;

        const anchor = context?.content?.anchor
            ?? (context?.target instanceof HTMLElement ? context.target : null);

        appendElementOnOverlayArea(<TextColorMenu anchor={anchor ?? undefined} />);
        return true;
    },
};