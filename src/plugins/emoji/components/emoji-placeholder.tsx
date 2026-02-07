/** @jsx h */

import { runCommand } from "@core/command/index.ts";
import { t } from "@core/i18n/index.ts";
import { InlineObjectPlaceholderUI } from "@components/ui/primitives/placeholder/inline-object-placeholder-ui.tsx";

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