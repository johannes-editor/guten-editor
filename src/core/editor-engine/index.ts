import { EditorManager } from "./editor-manager.tsx";

const editorManager = new EditorManager();

export const setRoot = (editorRoot: HTMLElement) => editorManager.setRoot(editorRoot);
export const appendElementOnRootArea = (element: HTMLElement) => editorManager.appendElementOnEditorRoot(element);
export const appendElementOnContentArea = (element: HTMLElement) => editorManager.appendElementOnContentArea(element);
export const appendElementOnOverlayArea = (element: HTMLElement) => editorManager.appendElementOnOverlayArea(element);

