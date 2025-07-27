/** @jsx h */

import { h } from "../../jsx.ts";
import { t } from "../../core/i18n/index.ts";
import { DomUtils } from "../../utils/dom-utils.ts";
import { SlashMenuItemData } from "./components/types.ts";
import { Paragraph } from "../../components/blocks/paragraph.tsx";
import { Heading1 } from "../../components/blocks/header1.tsx";
import { Heading2 } from "../../components/blocks/header2.tsx";
import { Heading3 } from "../../components/blocks/header3.tsx";
import { Heading4 } from "../../components/blocks/header4.tsx";
import { Heading5 } from "../../components/blocks/header5.tsx";
import { Blockquote } from "../../components/blocks/blockquote.tsx";
import { BulletedList } from "../../components/blocks/bulleted-list.tsx";
import { NumberedList } from "../../components/blocks/numbered-list.tsx";

export function defaultSlashMenuItems(block: HTMLElement | null): SlashMenuItemData[] {
    return [
        {
            sort: 10,
            label: t("paragraph"),
            synonyms: [t("paragraph"), t("text")],
            onSelect: () => {
                const element = DomUtils.insertElementAfter(block, <Paragraph />);
                DomUtils.focusOnElement(element);
            }
        },
        {
            sort: 20,
            label: t("heading_1"),
            synonyms: [t("title"), "h1"],
            onSelect: () => {
                const element = DomUtils.insertElementAfter(block, <Heading1 />);
                DomUtils.focusOnElement(element);
            }
        },
        {
            sort: 30,
            label: t("heading_2"),
            synonyms: [t("title"), "h2"],
            onSelect: () => {
                const element = DomUtils.insertElementAfter(block, <Heading2 />);
                DomUtils.focusOnElement(element);
            }
        },
        {
            sort: 40,
            label: t("heading_3"),
            synonyms: [t("title"), "h3"],
            onSelect: () => {
                const element = DomUtils.insertElementAfter(block, <Heading3 />);
                DomUtils.focusOnElement(element);
            }
        },
        {
            sort: 50,
            label: t("heading_4"),
            synonyms: [t("title"), "h4"],
            onSelect: () => {
                const element = DomUtils.insertElementAfter(block, <Heading4 />);
                DomUtils.focusOnElement(element);
            }
        },
        {
            sort: 60,
            label: t("heading_5"),
            synonyms: [t("title"), "h5"],
            onSelect: () => {
                const element = DomUtils.insertElementAfter(block, <Heading5 />);
                DomUtils.focusOnElement(element);
            }
        },
        {
            sort: 70,
            label: t("quotation"),
            synonyms: ["cite", "blockquote"],
            onSelect: () => {
                const element = DomUtils.insertElementAfter(block, <Blockquote />)
                DomUtils.focusOnElement(element);
            }
        },
        {
            sort: 80,
            label: t("bulleted_list"),
            synonyms: [t("list"), t("bulleted_list")],
            onSelect: () => {
                const element = DomUtils.insertElementAfter(block, <BulletedList />)
                const item = element.querySelector("li");
                DomUtils.focusOnElement(item);
            }
        },
        {
            sort: 90,
            label: t("numbered_list"),
            synonyms: [t("list"), t("numbered"), t("ordered")],
            onSelect: () => {
                const element = DomUtils.insertElementAfter(block, <NumberedList />)
                const item = element.querySelector("li");
                DomUtils.focusOnElement(item);
            }
        }
    ];
}