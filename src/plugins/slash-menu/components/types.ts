export interface SlashMenuItemData {
    sort: number;
    label: string;
    onSelect: () => void;
    synonyms?: string[];
}