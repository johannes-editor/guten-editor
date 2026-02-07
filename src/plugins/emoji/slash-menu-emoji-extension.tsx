import { t, registerTranslation } from "@core/i18n";
import { SlashMenuExtensionPlugin } from "@plugin/slash-menu";
import { appendElementOnOverlayArea } from "@components/editor";
import { EmojiPicker } from "./components/emoji-picker.tsx";
import { getCurrentSelectionRange } from "@utils/selection";
import { focusOnElement } from "@utils/dom";
import { en } from "./i18n/en.ts";
import { pt } from "./i18n/pt.ts";
import { EmojiIcon } from "@components/ui/icons";
import { EmojiPlaceholder } from "./components/emoji-placeholder.tsx";

export class SlashMenuEmojiExtension extends SlashMenuExtensionPlugin {

    icon: SVGElement = <EmojiIcon />;
    label: string = "";
    sort: number = 99;

    onSelect(focusedBlock: HTMLElement): void {
        const placeholder: HTMLElement = <EmojiPlaceholder />;

        let range = getCurrentSelectionRange();
        if (!range || !focusedBlock.contains(range.startContainer)) {
            range = document.createRange();
            range.selectNodeContents(focusedBlock);
            range.collapse(false);
        } else if (!range.collapsed) {
            range.collapse(false);
        }

        range.insertNode(placeholder);

        const after = document.createTextNode("\u200B");
        placeholder.parentNode?.insertBefore(after, placeholder.nextSibling);

        const sel = globalThis.getSelection();
        const caretRange = document.createRange();
        caretRange.setStart(after, 1);
        caretRange.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(caretRange);

        focusOnElement(focusedBlock);

        appendElementOnOverlayArea(
            <EmojiPicker range={caretRange.cloneRange()} placeholder={placeholder} />
        );
    }

    override setup(_root: HTMLElement): void {

        registerTranslation("en", en);
        registerTranslation("pt", pt);

        this.label = t("emoji_picker");
    }
}