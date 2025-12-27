// demo/main.ts
import { getEditorThemes, initEditor } from "../src/main.tsx";

const root = document.getElementById("editor")!;
console.log("Available editor themes:", getEditorThemes());
initEditor(root);