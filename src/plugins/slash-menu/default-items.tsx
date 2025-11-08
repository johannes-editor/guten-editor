/** @jsx h */

import { h, t, focusOnElement } from "../index.ts";
import { SlashMenuItemData } from "./components/types.ts";
import { ParagraphBlock } from "../../components/blocks/paragraph.tsx";
import { Heading1Block } from "../../components/blocks/header1.tsx";
import { Heading2Block } from "../../components/blocks/header2.tsx";
import { Heading3Block } from "../../components/blocks/header3.tsx";
import { Heading4Block } from "../../components/blocks/header4.tsx";
import { Heading5Block } from "../../components/blocks/header5.tsx";
import { BlockquoteBlock } from "../../components/blocks/blockquote.tsx";
import { BulletedListBlock } from "../../components/blocks/bulleted-list.tsx";
import { NumberedListBlock } from "../../components/blocks/numbered-list.tsx";
import { Heading1Icon, Heading2Icon, Heading3Icon, Heading4Icon, Heading5Icon, AwesomeListOlIcon, QuotationIcon, AwesomeListUlIcon, ParagraphIcon, SeparatorIcon } from "../../design-system/components/icons.tsx";
import { SeparatorBlock } from "../../components/blocks/separator.tsx";

export function defaultSlashMenuItems(): SlashMenuItemData[] {
    return [
        {
            icon: <ParagraphIcon />,
            sort: 10,
            label: t("paragraph"),
            synonyms: [t("text")],
            onSelect: (focusedBlock: HTMLElement) => {
                const element = <ParagraphBlock />;
                focusedBlock.after(element);
                focusOnElement(element);
            }
        },
        {
            icon: <Heading1Icon />,
            sort: 20,
            label: t("heading_1"),
            synonyms: [t("title"), "h1"],
            onSelect: (focusedBlock: HTMLElement) => {
                const element = <Heading1Block />;
                focusedBlock.after(element);
                focusOnElement(element);
            }
        },
        {
            icon: <Heading2Icon />,
            sort: 30,
            label: t("heading_2"),
            synonyms: [t("title"), "h2"],
            onSelect: (focusedBlock: HTMLElement) => {
                const element = <Heading2Block />;
                focusedBlock.after(element);
                focusOnElement(element);
            }
        },
        {
            icon: <QuotationIcon />,
            sort: 40,
            label: t("quotation"),
            synonyms: ["cite", "quote", "blockquote"],
            onSelect: (focusedBlock: HTMLElement) => {
                const element = <BlockquoteBlock />;
                focusedBlock.after(element);
                focusOnElement(element);
            }
        },
        {
            icon: <AwesomeListUlIcon />,
            sort: 50,
            label: t("bulleted_list"),
            synonyms: [t("list"), t("bulleted_list")],
            onSelect: (focusedBlock: HTMLElement) => {
                const element = <BulletedListBlock />;
                focusedBlock.after(element);
                const item = element.querySelector("li");
                focusOnElement(item);
            }
        },
        {
            icon: <AwesomeListOlIcon />,
            sort: 60,
            label: t("numbered_list"),
            synonyms: [t("list"), t("numbered"), t("ordered")],
            onSelect: (focusedBlock: HTMLElement) => {
                const element = <NumberedListBlock />;
                focusedBlock.after(element);
                const item = element.querySelector("li");
                focusOnElement(item);
            }
        },
        {
            icon: <Heading3Icon />,
            sort: 70,
            label: t("heading_3"),
            synonyms: [t("title"), "h3"],
            onSelect: (focusedBlock: HTMLElement) => {
                const element = <Heading3Block />;
                focusedBlock.after(element);
                focusOnElement(element);
            }
        },
        {
            icon: <Heading4Icon />,
            sort: 80,
            label: t("heading_4"),
            synonyms: [t("title"), "h4"],
            onSelect: (focusedBlock: HTMLElement) => {
                const element = <Heading4Block />;
                focusedBlock.after(element);
                focusOnElement(element);
            }
        },
        {
            icon: <Heading5Icon />,
            sort: 90,
            label: t("heading_5"),
            synonyms: [t("title"), "h5"],
            onSelect: (focusedBlock: HTMLElement) => {
                const element = <Heading5Block />;
                focusedBlock.after(element);
                focusOnElement(element);
            }
        },
        {
            icon: <SeparatorIcon />,
            sort: 95,
            label: t("separator"),
            synonyms: [t("divider"), t("line")],
            onSelect: (focusedBlock: HTMLElement) => {
                const separator = <SeparatorBlock />;
                const paragraph = <ParagraphBlock />;
                focusedBlock.after(separator);
                separator.after(paragraph);
                focusOnElement(paragraph);
            }
        }
    ];
}