import { Command } from "@core/command";
import { appendElementOnOverlayArea } from "@components/editor";
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