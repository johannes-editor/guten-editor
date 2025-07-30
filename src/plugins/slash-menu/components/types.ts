export interface SlashMenuItemData {
    sort: number;
    label: string;
    onSelect: (focusedBlock: HTMLElement) => void;
    synonyms?: string[];
}