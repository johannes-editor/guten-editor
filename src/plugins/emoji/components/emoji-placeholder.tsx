/** @jsx h */

import { h, runCommand } from "../../index.ts";
import { InlineObjectPlaceholderUI } from "../../../design-system/components/inline-object-placeholder-ui.tsx";
import { EmojiIcon } from "../../../design-system/components/icons.tsx";

export class EmojiPlaceholder extends InlineObjectPlaceholderUI {

    constructor() {
        super(<EmojiIcon />, "Emoji");
    }

    override onClick() {

        runCommand("openEmojiPicker", {
            content: { emojiPlaceholder: this }
        });
    }
}