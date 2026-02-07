import { Command } from "../../../core/command/command.ts";
import { appendElementOnOverlayArea } from "@components/editor";
import { ImageMenu } from "../components/image-menu.tsx";

export type OpenImageMenuPayload = {
    target?: HTMLElement | null;
    anchorRect?: DOMRectInit;
    initialUrl?: string;
    initialTab?: "upload" | "embed";
};

export const OpenImageMenu: Command<OpenImageMenuPayload> = {
    id: "openImageMenu",
    execute(context): boolean {
        const { target, anchorRect, initialUrl, initialTab } = context?.content ?? {};

        const rect = anchorRect ?? target?.getBoundingClientRect?.();
        const anchor = rect
            ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
            : undefined;

        appendElementOnOverlayArea(
            <ImageMenu
                target={target ?? null}
                anchorRect={anchor}
                initialUrl={initialUrl ?? target?.dataset?.imageSource ?? undefined}
                initialTab={initialTab}
            />
        );

        return true;
    },
};