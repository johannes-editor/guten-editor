/** @jsx h */

import { h } from "@core/jsx/index.ts";
import { Command } from "@core/command/index.ts";
import { appendElementOnOverlayArea } from "@components/editor/core/index.tsx";
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