/** @jsx h */

import { h, Command, focusOnElement, selection } from "../../index.ts";
import { BlockquoteBlock } from "../../../components/blocks/blockquote.tsx";
import { BulletedListBlock } from "../../../components/blocks/bulleted-list.tsx";
import { Heading1Block } from "../../../components/blocks/header1.tsx";
import { Heading2Block } from "../../../components/blocks/header2.tsx";
import { Heading3Block } from "../../../components/blocks/header3.tsx";
import { Heading4Block } from "../../../components/blocks/header4.tsx";
import { Heading5Block } from "../../../components/blocks/header5.tsx";
import { NumberedListBlock } from "../../../components/blocks/numbered-list.tsx";
import { ParagraphBlock } from "../../../components/blocks/paragraph.tsx";
import { SeparatorBlock } from "../../../components/blocks/separator.tsx";
import { InsertResultContext } from "../../../core/command/types.ts";

function resolveAfterBlock(context?: InsertResultContext): HTMLElement | null {
    if (context?.lastInsertedBlock) return context.lastInsertedBlock;
    if (context?.afterBlock) return context.afterBlock;
    return selection.findClosestBlockBySelection();
}

function appendAfter(afterBlock: HTMLElement | null, element: HTMLElement): HTMLElement | null {
    if (afterBlock?.parentElement) {
        afterBlock.after(element);
        return element;
    }

    const contentArea = document.getElementById("contentArea");
    if (!contentArea) return null;
    contentArea.appendChild(element);
    return element;
}

function focusIfNeeded(element: HTMLElement | null, context?: InsertResultContext) {
    if (!element) return;
    if (context?.focus === false) return;
    focusOnElement(element);
}

function updateLastInserted(element: HTMLElement | null, context?: InsertResultContext) {
    if (context) context.lastInsertedBlock = element;
}

function getInstructionText(context?: InsertResultContext): string | undefined {
    const text = context?.instruction?.content ?? undefined;
    return text ? text : undefined;
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

        const paragraph = <ParagraphBlock />;
        const insertedParagraph = appendAfter(insertedSeparator, paragraph);
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