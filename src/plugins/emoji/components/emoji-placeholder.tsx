/** @jsx h */

import { runCommand, t } from "../../index.ts";
import { InlineObjectPlaceholderUI } from "../../../design-system/components/inline-object-placeholder-ui.tsx";

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