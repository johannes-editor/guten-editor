import { Command, InsertResultContext } from "@core/command";
import { focusOnElement } from "@utils/dom";
import { BlockquoteBlock, BulletedListBlock, NumberedListBlock, ParagraphBlock, SeparatorBlock } from "@components/blocks";
import { Heading1Block, Heading2Block, Heading3Block, Heading4Block, Heading5Block } from "@components/blocks";
import { appendAfter, getInstructionText, resolveAfterBlock } from "@utils/dom";


function focusIfNeeded(element: HTMLElement | null, context?: InsertResultContext) {
    if (!element) return;
    if (context?.focus === false) return;
    focusOnElement(element);
}

function updateLastInserted(element: HTMLElement | null, context?: InsertResultContext) {
    if (context) context.lastInsertedBlock = element;
}

function createListItems(context?: InsertResultContext): HTMLElement[] | undefined {
    const items = context?.instruction?.items;
    if (!items?.length) return undefined;
    return items.map(item => <li>{item.text || <br />}</li>);
}

const createParagraphCommand = (id: string, HeadingComponent?: typeof ParagraphBlock): Command<InsertResultContext> => ({
    id,
    execute(ctx): boolean {
        const payload = ctx?.content;
        const afterBlock = resolveAfterBlock(payload );
        const text = getInstructionText(payload);
        const element = HeadingComponent
            ? <HeadingComponent>{text}</HeadingComponent>
            : <ParagraphBlock>{text}</ParagraphBlock>;

        const inserted = appendAfter(afterBlock, element);
        if (!inserted) return false;

        updateLastInserted(inserted, payload);
        focusIfNeeded(inserted, payload);
        return true;
    },
});

export const InsertParagraphCommand = createParagraphCommand("insertParagraph");
export const InsertHeading1Command = createParagraphCommand("insertHeading1", Heading1Block);
export const InsertHeading2Command = createParagraphCommand("insertHeading2", Heading2Block);
export const InsertHeading3Command = createParagraphCommand("insertHeading3", Heading3Block);
export const InsertHeading4Command = createParagraphCommand("insertHeading4", Heading4Block);
export const InsertHeading5Command = createParagraphCommand("insertHeading5", Heading5Block);

export const InsertBlockquoteCommand: Command<InsertResultContext> = {
    id: "insertBlockquote",
    execute(ctx): boolean {
        const payload = ctx?.content;
        const afterBlock = resolveAfterBlock(payload);
        const text = getInstructionText(payload);
        const element = <BlockquoteBlock>{text}</BlockquoteBlock>;

        const inserted = appendAfter(afterBlock, element);
        if (!inserted) return false;

        updateLastInserted(inserted, payload);
        focusIfNeeded(inserted, payload);
        return true;
    },
};

export const InsertBulletedListCommand: Command<InsertResultContext> = {
    id: "insertBulletedList",
    execute(ctx): boolean {
        const payload = ctx?.content;
        const afterBlock = resolveAfterBlock(payload);
        const items = createListItems(payload);
        const element = <BulletedListBlock>{items}</BulletedListBlock>;

        const inserted = appendAfter(afterBlock, element);
        if (!inserted) return false;

        const firstItem = inserted.querySelector("li");
        updateLastInserted(inserted, payload);
        focusIfNeeded(firstItem ?? inserted, payload);
        return true;
    },
};

export const InsertNumberedListCommand: Command<InsertResultContext> = {
    id: "insertNumberedList",
    execute(ctx): boolean {
        const payload = ctx?.content;
        const afterBlock = resolveAfterBlock(payload);
        const items = createListItems(payload);
        const element = <NumberedListBlock>{items}</NumberedListBlock>;

        const inserted = appendAfter(afterBlock, element);
        if (!inserted) return false;

        const firstItem = inserted.querySelector("li");
        updateLastInserted(inserted, payload);
        focusIfNeeded(firstItem ?? inserted, payload);
        return true;
    },
};

export const InsertSeparatorCommand: Command<InsertResultContext> = {
    id: "insertSeparator",
    execute(ctx): boolean {
        const payload = ctx?.content;
        const afterBlock = resolveAfterBlock(payload);
        const separator = <SeparatorBlock />;
        const insertedSeparator = appendAfter(afterBlock, separator);
        if (!insertedSeparator) return false;

        const shouldCreateParagraph = payload?.createTrailingParagraph ?? true;

        const paragraph = shouldCreateParagraph ? <ParagraphBlock /> : null;
        const insertedParagraph = paragraph ? appendAfter(insertedSeparator, paragraph) : null;
        updateLastInserted(insertedParagraph ?? insertedSeparator, payload);

        focusIfNeeded(insertedParagraph ?? insertedSeparator, payload);
        return true;
    },
};

export const SlashMenuCommands: Command<InsertResultContext>[] = [
    InsertParagraphCommand,
    InsertHeading1Command,
    InsertHeading2Command,
    InsertHeading3Command,
    InsertHeading4Command,
    InsertHeading5Command,
    InsertBlockquoteCommand,
    InsertBulletedListCommand,
    InsertNumberedListCommand,
    InsertSeparatorCommand,
];