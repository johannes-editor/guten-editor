import type { EditorSettingsItemData } from "./types.ts";

let items: EditorSettingsItemData[] = [];

export function setEditorSettingsItems(nextItems: EditorSettingsItemData[]): void {
    items = [...nextItems];
}

export function getEditorSettingsItems(): EditorSettingsItemData[] {
    return items;
}