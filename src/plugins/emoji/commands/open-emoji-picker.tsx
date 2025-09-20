/** @jsx h */

import { Command } from "../../../core/command/command.ts";
import { h, appendElementOnOverlayArea } from "../../index.ts";
import { EmojiPicker } from "../components/emoji-picker.tsx";

type OpenEmojiPickerContext = {
    emojiPlaceholder?: HTMLElement | null;
    range: Range;
};

export const OpenEmojiPicker: Command<OpenEmojiPickerContext> = {
    id: "openEmojiPicker",
    execute(context): boolean {

        console.log("executado comando openEmojiPicker");

        const { emojiPlaceholder, range } = context?.content ?? {};

        appendElementOnOverlayArea(
            <EmojiPicker range={range} placeholder={emojiPlaceholder} />
        );

        return true;
    }
};