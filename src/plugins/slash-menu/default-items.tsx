/** @jsx h */

import { h, t, runCommand } from "../index.ts";
import { SlashMenuItemData } from "./components/types.ts";
import { Heading1Icon, Heading2Icon, Heading3Icon, Heading4Icon, Heading5Icon, AwesomeListOlIcon, QuotationIcon, AwesomeListUlIcon, ParagraphIcon, SeparatorIcon } from "../../design-system/components/icons.tsx";

export function defaultSlashMenuItems(): SlashMenuItemData[] {
    return [
        {
            icon: <ParagraphIcon />,
            sort: 10,
            label: t("paragraph"),
            synonyms: [t("text")],
            onSelect: (focusedBlock: HTMLElement) => {
                runCommand("insertParagraph", { content: { afterBlock: focusedBlock } });
            }
        },
        {
            icon: <Heading1Icon />,
            sort: 20,
            label: t("heading_1"),
            shortcut: "#",
            synonyms: [t("title"), "h1"],
            onSelect: (focusedBlock: HTMLElement) => {
                runCommand("insertHeading1", { content: { afterBlock: focusedBlock } });
            }
        },
        {
            icon: <Heading2Icon />,
            sort: 30,
            label: t("heading_2"),
            shortcut: "##",
            synonyms: [t("title"), "h2"],
            onSelect: (focusedBlock: HTMLElement) => {
                runCommand("insertHeading2", { content: { afterBlock: focusedBlock } });
            }
        },
        {
            icon: <QuotationIcon />,
            sort: 40,
            label: t("quotation"),
            shortcut: ">",
            synonyms: ["cite", "quote", "blockquote"],
            onSelect: (focusedBlock: HTMLElement) => {
                runCommand("insertBlockquote", { content: { afterBlock: focusedBlock } });
            }
        },
        {
            icon: <AwesomeListUlIcon />,
            sort: 50,
            label: t("bulleted_list"),
            shortcut: "-",
            synonyms: [t("list"), t("bulleted_list")],
            onSelect: (focusedBlock: HTMLElement) => {
                runCommand("insertBulletedList", { content: { afterBlock: focusedBlock } });
            }
        },
        {
            icon: <AwesomeListOlIcon />,
            sort: 60,
            label: t("numbered_list"),
            shortcut: "1.",
            synonyms: [t("list"), t("numbered"), t("ordered")],
            onSelect: (focusedBlock: HTMLElement) => {
                runCommand("insertNumberedList", { content: { afterBlock: focusedBlock } });
            }
        },
        {
            icon: <Heading3Icon />,
            sort: 70,
            label: t("heading_3"),
            shortcut: "###",
            synonyms: [t("title"), "h3"],
            onSelect: (focusedBlock: HTMLElement) => {
                runCommand("insertHeading3", { content: { afterBlock: focusedBlock } });
            }
        },
        {
            icon: <Heading4Icon />,
            sort: 80,
            label: t("heading_4"),
            shortcut: "####",
            synonyms: [t("title"), "h4"],
            onSelect: (focusedBlock: HTMLElement) => {
                runCommand("insertHeading4", { content: { afterBlock: focusedBlock } });
            }
        },
        {
            icon: <Heading5Icon />,
            sort: 90,
            label: t("heading_5"),
            synonyms: [t("title"), "h5"],
            onSelect: (focusedBlock: HTMLElement) => {
                runCommand("insertHeading5", { content: { afterBlock: focusedBlock } });
            }
        },
        {
            icon: <SeparatorIcon />,
            sort: 95,
            label: t("separator"),
            shortcut: "---",
            synonyms: [t("divider"), t("line")],
            onSelect: (focusedBlock: HTMLElement) => {
                runCommand("insertSeparator", { content: { afterBlock: focusedBlock } });
            }
        }
    ];
}