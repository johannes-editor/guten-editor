import { Command } from "@core/command/command.ts";
import { colorUtil } from "@utils/color/index.ts";

type TextColorPayload = {
    color: string;
};

export const SetTextColor: Command<TextColorPayload> = {
    id: "setTextColor",
    execute(context) {
        const requested = (context?.content?.color ?? "").trim();
        const anchor = colorUtil.getSelectionAnchorElement();

        const hex = colorUtil.resolveCssColorToHex(
            requested === "initial" ? "inherit" : requested,
            anchor
        );

        if (!hex) return false;

        try {
            return document.execCommand("foreColor", false, hex);
        } catch {
            return false;
        }
    },
};