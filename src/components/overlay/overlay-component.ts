import { Component } from "../component.ts";
import { DefaultProps, DefaultState } from "../types.ts";
import { pushOverlay, removeOverlay } from "./index.ts";
import { CloseableOverlay } from "./types.ts";

export type OverlayCtor = new (...args: any[]) => OverlayComponent<any, any>;

/**
 * Base class for UI overlays (e.g. modals, dropdowns).
 * Handles z-index and optional auto-removal on outside click.
 *
 * @template P Props type
 * @template S State type
 */

export abstract class OverlayComponent<P = DefaultProps, S = DefaultState> extends Component<P, S> implements CloseableOverlay {

    zIndex: number = 1000;

    public canOverlayClasses: ReadonlySet<OverlayCtor> = new Set();

    /** If true, removes the overlay when clicking outside (default: true) */
    closeOnClickOutside: boolean = true;

    // Internal flag to ignore the first outside click after rendering
    private listenClickOutside: boolean = false;

    /** Called when the element is added to the DOM */
    override connectedCallback(): void {
        super.connectedCallback();

        this.style.position = "absolute";
        this.style.zIndex = this.zIndex.toString();
        pushOverlay(this);

        //Set a timeout to 
        setTimeout(() => {
            this.listenClickOutside = true;
        }, 300);

        this.classList.add("animate-overlay");
    }

    /** Called when the element is removed from the DOM */
    override disconnectedCallback(): void {
        super.disconnectedCallback();
        removeOverlay(this);
    }

    get canCloseOnClickOutside2(): boolean {
        return this.closeOnClickOutside === true && this.listenClickOutside === true;
    }

    override remove(): void {
        const finishRemoval = () => requestAnimationFrame(() => super.remove());
        const hadShowOverlay = this.classList.contains("show-overlay");

        this.classList.remove("show-overlay");

        if (!hadShowOverlay) {
            this.classList.remove("animate-overlay");
            super.remove();
            return;
        }

        let completed = false;
        const onComplete = () => {
            if (completed) return;
            completed = true;
            finishRemoval();
        };

        const fallback = globalThis.setTimeout(onComplete, 200);
        this.addEventListener("transitionend", () => {
            globalThis.clearTimeout(fallback);
            onComplete();
        }, { once: true });
    }

    override afterRender(): void {
        requestAnimationFrame(() => {
            this.classList.add("show-overlay");
        });
    }

    public canOverlay(other: HTMLElement): boolean {
        if (!(other instanceof OverlayComponent)) return true;
        if (this.canOverlayClasses.size > 0) {
            for (const ctor of this.canOverlayClasses) {
                if (other instanceof ctor) {
                    return true;
                }
            }
            return false;
        }
        return false;
    }

    private getAnchorRect(anchor: Node): DOMRect | null {
        if (!anchor || !anchor.parentNode) return null;

        const r = document.createRange();

        if (anchor instanceof Text) {
            r.setStart(anchor, 0);
            r.setEnd(anchor, Math.min(1, anchor.length));
        } else {
            r.selectNode(anchor);
        }

        const rects = r.getClientRects();
        if (rects.length > 0) return rects[0];
        return r.getBoundingClientRect();
    }

    positionToAnchor(anchor: Node) {

        const rect =
            this.getAnchorRect(anchor);

        if (!rect) return;

        const gap = 2;

        const parent = (this as unknown as HTMLElement).offsetParent as HTMLElement | null;
        const pad = parent
            ? (() => {
                const pr = parent.getBoundingClientRect();
                const left = pr.left + parent.clientLeft;
                const top = pr.top + parent.clientTop;
                const right = left + parent.clientWidth;
                const bottom = top + parent.clientHeight;
                return { left, top, right, bottom };
            })()
            : { left: 0, top: 0, right: globalThis.innerWidth, bottom: globalThis.innerHeight };

        this.style.position = 'absolute';

        const { width: menuWidth, height: menuHeight } = this.getBoundingClientRect();

        const spaceBelow = globalThis.innerHeight - rect.bottom;
        const showAbove = spaceBelow < menuHeight && rect.top > menuHeight;

        if (showAbove) {
            this.style.bottom = `${pad.bottom - (rect.top - gap)}px`;
            this.style.top = '';
        } else {
            this.style.top = `${(rect.bottom + gap) - pad.top}px`;
            this.style.bottom = '';
        }


        const spaceRight = globalThis.innerWidth - rect.right;
        const spaceLeft = rect.left;
        const showRight = spaceRight >= menuWidth || spaceRight >= spaceLeft;

        if (showRight) {

            this.style.left = `${(rect.right + gap) - pad.left}px`;
            this.style.right = '';
        } else {
            this.style.right = `${pad.right - (rect.left - gap)}px`;
            this.style.left = '';
        }
    }
}