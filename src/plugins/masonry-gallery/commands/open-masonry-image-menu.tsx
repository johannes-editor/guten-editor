import { Command } from "@core/command";
import { appendElementOnOverlayArea } from "@components/editor";
import { MasonryImageMenu } from "../components/masonry-image-menu.tsx";

export type OpenMasonryImageMenuContext = {
    target?: HTMLElement | null;
    anchorRect?: DOMRectInit;
    initialUrl?: string;
    initialTab?: "upload" | "embed";
};

export const OpenMasonryImageMenu: Command<OpenMasonryImageMenuContext> = {
    id: "openMasonryImageMenu",
    execute(context): boolean {
        const { target, anchorRect, initialUrl, initialTab } = context?.content ?? {};

        const rect = anchorRect ?? target?.getBoundingClientRect?.();
        const anchor = rect
            ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
            : undefined;

        appendElementOnOverlayArea(
            <MasonryImageMenu
                target={target ?? null}
                anchorRect={anchor}
                initialUrl={initialUrl ?? target?.dataset?.imageSource ?? undefined}
                initialTab={initialTab}
            />
        );

        return true;
    },
};