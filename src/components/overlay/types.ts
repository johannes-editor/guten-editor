/**
 * Interface for overlay elements that can be closed by clicking outside.
 */
export interface CloseableOverlay {
    closeOnClickOutside?: boolean;
}

/**
 * Defines how the overlay stack should react when a new overlay is opened.
 */
export enum OverlayOpenStrategy {
    /** Keep the current stack untouched when the overlay opens. */
    KeepStack = "keepStack",

    /**
     * Close overlays that don't allow stacking before inserting the new
     * overlay. This is the default behaviour.
     */
    CloseDisallowed = "closeDisallowed",

    /** Close the entire stack before inserting the new overlay. */
    ClearStack = "clearStack",
}

/**
 * Options that describe how an overlay interacts with the stack.
 */
export interface OverlayStackOptions {
    /**
     * When true, the overlay remains in the stack even if other overlays are
     * opened later.
     */
    allowOverlayOnTop?: boolean;

    /** Strategy that should be applied when this overlay is opened. */
    openStrategy?: OverlayOpenStrategy;
}

/**
 * Overlays that expose stack options. The stack manager uses this information
 * to decide whether other overlays must be closed when a new one is opened.
 */
export interface OverlayStackAware extends CloseableOverlay {
    getOverlayStackOptions?: () => OverlayStackOptions;
    canCloseOnClickOutside2?: boolean;
}
