/** @jsx h */

import { h } from "../../jsx.ts";
import { SlashMenuExtensionPlugin } from "../slash-menu/slash-menu-plugin.tsx";
import { EmojiPicker } from "./components/emoji-picker.tsx";
import { appendElementOnOverlayArea, focusOnElement, timing } from "../index.ts";
import { SelectionUtils } from "../../utils/selection/selection-utils.ts";
import { registerTranslation, t } from "../index.ts";

import { en } from "./i18n/en.ts";
import { pt } from "./i18n/pt.ts";
import { EmojiIcon } from "../../design-system/components/icons.tsx";
import { EmojiPlaceholder } from "./components/emoji-placeholder.tsx";

export class SlashMenuEmojiExtension extends SlashMenuExtensionPlugin {

    icon: SVGElement = <EmojiIcon />;
    label: string = "";
    sort: number = 99;

    async onSelect(focusedBlock: HTMLElement): Promise<void> {
        const element: HTMLElement = <EmojiPlaceholder />;

        let range = SelectionUtils.getCurrentSelectionRange();

        if (!range || !focusedBlock.contains(range.startContainer)) {
            range = document.createRange();
            range.selectNodeContents(focusedBlock);
            range.collapse(false);
        } else if (!range.collapsed) {
            range.collapse(false);
        }

        range.insertNode(element);

        if (!element.nextSibling) {
            element.parentNode?.insertBefore(document.createTextNode("\u200B"), element.nextSibling);
        }

        const sel = window.getSelection();
        range.setStartAfter(element);
        range.setEndAfter(element);
        sel?.removeAllRanges();
        sel?.addRange(range);


        await timing.waitFrames(2);

        range = SelectionUtils.getCurrentSelectionRange();

        if (!range) {
            return;
        }

        focusOnElement(element);
        appendElementOnOverlayArea(
            <EmojiPicker range={range.cloneRange()} placeholder={element} />
        );
    }

    override setup(_root: HTMLElement): void {

        registerTranslation("en", en);
        registerTranslation("pt", pt);

        this.label = t("emoji_picker");
    }
}