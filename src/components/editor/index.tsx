/** @jsx h */

import { h } from "../../jsx.ts";
import { Editor } from "./editor.tsx";

const editor = <Editor />;

export const setRoot = (editorRoot: HTMLElement) => editor.setRoot(editorRoot);
export const appendElementOnRootArea = (element: HTMLElement) => editor.appendElementOnEditorRoot(element);
export const appendElementOnContentArea = (element: HTMLElement) => editor.appendElementOnContentArea(element);
export const appendElementOnOverlayArea = (element: HTMLElement) => editor.appendElementOnOverlayArea(element);

