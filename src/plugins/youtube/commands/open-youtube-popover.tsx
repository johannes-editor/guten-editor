/** @jsx h */

import { h } from "@core/jsx";
import { t } from "@core/i18n";
import { Command } from "@core/command";
import { appendElementOnOverlayArea } from "@components/editor";
import { InputTypes } from "@utils/dom";
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
                inputType={InputTypes.Url}
                inputPlaceholder={t("paste_or_type_a_youtube_link")}
                anchorRect={anchor}
            />
        );

        return true;
    },
};