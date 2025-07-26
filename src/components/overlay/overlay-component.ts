import { Component } from "../component.ts";
import { DefaultProps, DefaultState } from "../types.ts";
import { pushOverlay, removeOverlay } from "./index.ts";
import { CloseableOverlay } from "./types.ts";

/**
 * Base class for UI overlays (e.g. modals, dropdowns).
 * Handles z-index and optional auto-removal on outside click.
 *
 * @template P Props type
 * @template S State type
 */
export abstract class OverlayComponent<P = DefaultProps, S = DefaultState> extends Component<P, S> implements CloseableOverlay {

    zIndex: number = 1000;

    /** If true, removes the overlay when clicking outside (default: true) */
    closeOnClickOutside: boolean = true;

    /** Called when the element is added to the DOM */
    override connectedCallback(): void {
        super.connectedCallback();

        this.style.position = "absolute";
        this.style.zIndex = this.zIndex.toString();
        pushOverlay(this);
    }

    /** Called when the element is removed from the DOM */
    override disconnectedCallback(): void {
        super.disconnectedCallback();
        removeOverlay(this);
    }
}