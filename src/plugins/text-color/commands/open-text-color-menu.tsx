/** @jsx h */
import { Command } from "../../../core/command/command.ts";
import { h, appendElementOnOverlayArea, hasSelection } from "../../index.ts";
import { TextColorMenu } from "../components/text-menu.tsx";

type OpenColorMenuPayload = {
    anchor?: HTMLElement | null;
};

export const OpenTextColorMenu: Command<OpenColorMenuPayload> = {
    id: "openTextColorMenu",
    execute(context) {
        console.log("opa, deveria exxibir o TextColorMenu");
        console.log("context: ", context);
        if (!hasSelection()) return false;

        const anchor = context?.content?.anchor
            ?? (context?.target instanceof HTMLElement ? context.target : null);

        appendElementOnOverlayArea(<TextColorMenu anchor={anchor ?? undefined} />);
        return true;
    },
};