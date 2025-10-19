/** @jsx h */

import { Command } from "../../../core/command/command.ts";
import { appendElementOnOverlayArea, dom, h, t } from "../../index.ts";
import { YouTubePopover } from "../components/youtube-popover.tsx";

export type OpenYouTubePopoverPayload = {
    target?: HTMLElement | null;
    initialValue?: string;
    anchorRect?: DOMRectInit;
};

export const OpenYouTubePopover: Command<OpenYouTubePopoverPayload> = {
    id: "openYouTubePopover",
    execute(context): boolean {
        const { target, initialValue, anchorRect } = context?.content ?? {};

        const rect = anchorRect ?? target?.getBoundingClientRect?.();
        const anchor = rect
            ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
            : undefined;

        appendElementOnOverlayArea(
            <YouTubePopover
                target={target ?? null}
                initialValue={initialValue ?? undefined}
                inputType={dom.InputTypes.Url}
                inputPlaceholder={t("paste_or_type_a_youtube_link")}
                anchorRect={anchor}
            />
        );

        return true;
    },
};