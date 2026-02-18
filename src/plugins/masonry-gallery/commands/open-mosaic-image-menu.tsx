import { Command } from "@core/command";
import { appendElementOnOverlayArea } from "@components/editor";
import { MosaicImageMenu } from "../components/mosaic-image-menu.tsx";

export type OpenMosaicImageMenuPayload = {
    target?: HTMLElement | null;
    anchorRect?: DOMRectInit;
    initialUrl?: string;
    initialTab?: "upload" | "embed";
};

export const OpenMosaicImageMenu: Command<OpenMosaicImageMenuPayload> = {
    id: "openMosaicImageMenu",
    execute(context): boolean {
        const { target, anchorRect, initialUrl, initialTab } = context?.content ?? {};

        const rect = anchorRect ?? target?.getBoundingClientRect?.();
        const anchor = rect
            ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
            : undefined;

        appendElementOnOverlayArea(
            <MosaicImageMenu
                target={target ?? null}
                anchorRect={anchor}
                initialUrl={initialUrl ?? target?.dataset?.imageSource ?? undefined}
                initialTab={initialTab}
            />
        );

        return true;
    },
};