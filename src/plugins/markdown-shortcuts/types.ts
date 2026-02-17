export type MarkdownShortcutTrigger = "space" | "enter";

export type MarkdownShortcutHandlerResult =
    | boolean
    | {
        handled?: boolean;
        removeBlock?: boolean;
    };

export type MarkdownShortcutMatch = {
    text: string;
    match?: RegExpMatchArray | null;
};

export type MarkdownShortcutContext = {
    block: HTMLElement;
    trigger: MarkdownShortcutTrigger;
    textBeforeCaret: string;
    afterText: string;
    match: MarkdownShortcutMatch;
    event: KeyboardEvent | InputEvent;
    selection: Selection;
};

export type MarkdownShortcutRule = {
    pattern: string | RegExp;
    trigger: MarkdownShortcutTrigger;
    sort?: number;
    onMatch: (context: MarkdownShortcutContext) => MarkdownShortcutHandlerResult | void;
};