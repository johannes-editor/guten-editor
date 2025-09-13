/** @jsx h */

import { h } from "../../jsx.ts";
import { SlashMenuExtensionPlugin } from "../slash-menu/slash-menu-plugin.tsx";
import { EmojiPickerOverlay } from "./components/emoji-picker-overlay.tsx";
import { appendElementOnOverlayArea } from "../index.ts";
import { SelectionUtils } from "../../utils/selection/selection-utils.ts";
import { registerTranslation, t } from "../index.ts";

import { en } from "./i18n/en.ts";
import { pt } from "./i18n/pt.ts";
import { EmojiIcon } from "../../design-system/components/icons.tsx";

export class EmojiPickerSlashMenuExtensionPlugin extends SlashMenuExtensionPlugin {

    icon: SVGElement = <EmojiIcon />;
    label: string = "";
    sort: number = 99;

    onSelect(): void {
        const range = SelectionUtils.getCurrentSelectionRange();

        appendElementOnOverlayArea(
            <EmojiPickerOverlay range={range} />
        );
    }

    override setup(_root: HTMLElement): void {

        registerTranslation("en", en);
        registerTranslation("pt", pt);

        this.label = t("emoji_picker");
    }
}