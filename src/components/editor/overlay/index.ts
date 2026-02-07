import { OverlayStack } from "./overlay-stack.ts";

const overlayStack = new OverlayStack();

/**
 * Adds a new overlay element to the stack.
 * For more details, see `OverlayStack.push`.
 * @param element The overlay element to add.
 */
export const pushOverlay = (element: HTMLElement) => overlayStack.push(element);

/**
 * Removes a specific overlay element from the stack and the DOM.
 * For more details, see `OverlayStack.remove`.
 * @param element The overlay element to remove.
 */
export const removeOverlay = (element: HTMLElement) => overlayStack.remove(element);


export { OverlayComponent } from "./overlay-component.tsx";
export type { OverlayCtor } from "./overlay-component.tsx";
