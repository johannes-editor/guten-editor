export interface SlashMenuItemData {
    icon: SVGElement;
    label: string;
    sort: number;
    onSelect: (focusedBlock: HTMLElement) => void;
    synonyms?: string[];
}