export type InsertBlockPayload = {
    /** Block after which new content should be inserted. */
    afterBlock?: HTMLElement | null;

    /** Parsed paste instruction with content for the block. */
    instruction?: PasteBlockInstruction;

    /** Whether the command should move the caret to the newly created content. */
    focus?: boolean;
};

export type InsertResultContext = InsertBlockPayload & {
    /**
     * The last block created by a command. Commands can update this property so
     * subsequent commands in the same flow know where to insert new blocks.
     */
    lastInsertedBlock?: HTMLElement | null;
};


export type PasteBlockInstruction = {
    type: string;
    content?: string;
    items?: Array<{ text: string; checked?: boolean }>;
    rows?: string[][];
    attrs?: Record<string, string>;
};

export type PasteBlocksEventDetail = {
    instructions: PasteBlockInstruction[];
};