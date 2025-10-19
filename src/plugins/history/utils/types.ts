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

export interface DocumentChange {
    before: NodeSnapshot[];
    after: NodeSnapshot[];
    beforeSelection?: SelectionSnapshot;
    afterSelection?: SelectionSnapshot;
}

export interface Transaction {
    beforeNodes: NodeSnapshot[];
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