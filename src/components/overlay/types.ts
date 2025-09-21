/**
 * Interface for overlay elements that can be closed by clicking outside.
 */
export interface CloseableOverlay {
    closeOnClickOutside?: boolean;
}

/**
 * Options that describe how an overlay interacts with the stack when it is
 * opened.
 */
export interface OverlayStackOptions {
    /**
     * Indicates if the overlay should keep previously opened overlays in the
     * stack (i.e. if it can sit on top of them) instead of clearing them.
     */
    canOverlay?: boolean;

    /**
     * CSS selectors (or tag names) describing the overlays that this element
     * is allowed to stack on top of. When omitted or empty, the overlay will
     * clear the stack before being inserted.
     */
    overlayTargets?: readonly string[];
}

/**
 * Overlays that expose stack options. The stack manager uses this information
 * to decide whether other overlays must be closed when a new one is opened.
 */
export interface OverlayStackAware extends CloseableOverlay {
    getOverlayStackOptions?: () => OverlayStackOptions;
    canCloseOnClickOutside2?: boolean;
}
