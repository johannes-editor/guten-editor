export interface SelectionSnapshot {
    anchorPath: number[];
    anchorOffset: number;
    focusPath: number[];
    focusOffset: number;
    isCollapsed: boolean;
}

export type NodeSnapshot =
    | { kind: "text"; text: string }
    | { kind: "comment"; text: string }
    | { kind: "element"; html: string };

export type ChangeRecord =
    | { type: "text"; path: number[]; before: string; after: string }
    | { type: "attribute"; path: number[]; attribute: string; before: string | null; after: string | null }
    | { type: "insert"; parentPath: number[]; index: number; nodes: NodeSnapshot[] }
    | { type: "remove"; parentPath: number[]; index: number; nodes: NodeSnapshot[] };

export interface DocumentChange {
    changes: ChangeRecord[];
    beforeSelection?: SelectionSnapshot;
    afterSelection?: SelectionSnapshot;
}

export interface Transaction {
    changes: ChangeRecord[];
    beforeSelection?: SelectionSnapshot;
}

export const observerConfig: MutationObserverInit = {
    attributes: true,
    attributeOldValue: true,
    characterData: true,
    characterDataOldValue: true,
    childList: true,
    subtree: true,
};

export const MAX_HISTORY = 1000;
export const TYPING_COMMIT_DELAY = 150;
export const COMMAND_COMMIT_DELAY = 15;