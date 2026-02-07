/** @jsx h */

import { h } from "@core/jsx/index.ts";
import { Command } from "@core/command/command.ts";
import { hasSelection } from "@utils/selection/index.ts";
import { appendElementOnOverlayArea } from "@components/editor/core/index.tsx";
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