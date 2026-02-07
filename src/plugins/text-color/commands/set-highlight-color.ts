import { Command } from "@core/command";
import { colorUtil } from "@utils/color/index.ts";

type HighlightPayload = {
    color: string;
};

function tryExecHighlight(color: string): boolean {
    try {
        try { document.execCommand("styleWithCSS", false); } catch { }
        const ok = document.execCommand("hiliteColor", false, color)
            || document.execCommand("backColor", false, color);
        try { document.execCommand("styleWithCSS", false); } catch { }
        return ok;
    } catch {
        return false;
    }
}

export const SetHighlightColor: Command<HighlightPayload> = {
    id: "setHighlightColor",
    execute(context) {
        const requested = (context?.content?.color ?? "").trim();
        const anchor = colorUtil.getSelectionAnchorElement();

        if (requested === "transparent" || requested === "initial") {
            colorUtil.clearInlineHighlightInSelection();
            return true;
        }

        const hex = colorUtil.resolveCssColorToHex(requested, anchor);
        if (!hex) return false;

        return tryExecHighlight(hex);
    },
};