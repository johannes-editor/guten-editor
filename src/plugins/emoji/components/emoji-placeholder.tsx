/** @jsx h */

import { runCommand } from "@core/command";
import { t } from "@core/i18n";
import { InlineObjectPlaceholderUI } from "@components/ui/primitives/placeholder";

export class EmojiPlaceholder extends InlineObjectPlaceholderUI {

    constructor() {
        super(t("emoji"));
    }

    override onClick() {
        runCommand("openEmojiPicker", {
            content: { emojiPlaceholder: this }
        });
    }
}