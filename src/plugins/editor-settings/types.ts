export interface EditorSettingsItemData {
    icon?: Element;
    label: string;
    sort: number;
    rightIndicator?: "auto" | "check" | "chevron" | "none";
    onSelect: (anchor: HTMLElement, menu: HTMLElement) => boolean | void;
}