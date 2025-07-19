import { EditorManager } from "./editor-manager.ts";
import { OverlayManager } from "../editor-engine/overlay-manager.ts";
import { OverlayComponent } from "../../components/overlay-component.ts";

const editorManager = new EditorManager();
const overlayManager = new OverlayManager();

export const setRoot = (editorRoot: HTMLElement) => editorManager.setRoot(editorRoot);
export const appendChildren = (element: Node) => editorManager.appendChildren(element);

export const appendOverlay = (element: OverlayComponent) => editorManager.appendOverlay(element);

export const push = (element: HTMLElement) => overlayManager.push(element);
export const remove = (element: HTMLElement) => overlayManager.remove(element);
