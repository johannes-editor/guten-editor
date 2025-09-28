/** @jsx h */
import { BlockOptions, type BlockOptionsProps } from "./block-options.tsx";
import type { DefaultState } from "../../../components/types.ts";
import type { OverlayCtor } from "../../../components/overlay/overlay-component.ts";

export interface BlockOptionsOverlayMenuProps extends BlockOptionsProps {
    /** Element that triggered the menu; used for positioning beside the parent options list. */
    anchor?: HTMLElement;
}

export abstract class BlockOptionsOverlayMenu<
    Props extends BlockOptionsOverlayMenuProps = BlockOptionsOverlayMenuProps,
    State extends DefaultState = DefaultState,
> extends BlockOptions {

    override props: Props = {} as Props;
    override state: State = {} as State;

    override canOverlayClasses: ReadonlySet<OverlayCtor> = new Set<OverlayCtor>([BlockOptions]);

    /** Horizontal gap (in px) between the parent menu and this overlay. */
    protected overlayGap = 8;

    override onMount(): void {
        super.onMount();
        this.closeOnClickOutside = true;
    }

    override afterRender(): void {
        super.afterRender();
        const anchor = this.props.anchor;
        if (anchor) {
            requestAnimationFrame(() => this.positionRelativeToMenu(anchor));
        }
    }

    /**
     * Computes the bounding box available for overlay positioning.
     * Uses the overlay's offset parent when available, otherwise falls back to the viewport bounds.
     */
    protected getOverlayBounds() {
        const parent = this.offsetParent as HTMLElement | null;
        if (parent) {
            const rect = parent.getBoundingClientRect();
            const width = parent.clientWidth;
            const height = parent.clientHeight;

            if (width > 0 && height > 0) {
                const left = rect.left + parent.clientLeft;
                const top = rect.top + parent.clientTop;
                return {
                    left,
                    top,
                    right: left + width,
                    bottom: top + height,
                    width,
                    height,
                };
            }
        }

        const viewportWidth = globalThis.innerWidth;
        const viewportHeight = globalThis.innerHeight;

        return {
            left: 0,
            top: 0,
            right: viewportWidth,
            bottom: viewportHeight,
            width: viewportWidth,
            height: viewportHeight,
        };
    }

    /**
     * Positions the overlay beside the parent options menu while clamping it within the available bounds.
     * Subclasses can override this to customize alignment behaviour.
     */
    protected positionRelativeToMenu(anchor: HTMLElement): void {
        const menuContainer = anchor.closest(".guten-menu");
        if (!menuContainer) {
            this.positionToAnchor(anchor);
            return;
        }

        const bounds = this.getOverlayBounds();
        const menuRect = menuContainer.getBoundingClientRect();
        const anchorRect = anchor.getBoundingClientRect();
        const overlayRect = this.getBoundingClientRect();

        const anchorCenter = anchorRect.top + (anchorRect.height / 2);
        const desiredTop = anchorCenter - (overlayRect.height / 2) - bounds.top;
        let left = menuRect.right + this.overlayGap - bounds.left;

        if (left + overlayRect.width > bounds.width) {
            left = menuRect.left - this.overlayGap - overlayRect.width - bounds.left;
            if (left < 0) {
                left = Math.max(bounds.width - overlayRect.width, 0);
            }
        }

        const maxTop = Math.max(bounds.height - overlayRect.height, 0);
        let top = Math.min(Math.max(desiredTop, 0), maxTop);

        if (top < 0) top = 0;
        if (left < 0) left = 0;

        this.style.top = `${top}px`;
        this.style.left = `${left}px`;
        this.style.bottom = "";
        this.style.right = "";
    }
}
