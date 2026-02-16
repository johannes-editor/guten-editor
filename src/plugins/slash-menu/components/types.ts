export interface SlashMenuItemData {
    icon: SVGElement;
    label: string;
    shortcut?: string;
    sort: number;
    onSelect: (focusedBlock: HTMLElement) => void;
    synonyms?: string[];
    preserveEmptyBlock?: boolean;
}