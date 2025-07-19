/** @jsx h */
import { h } from "../../jsx.ts";
import { SlashMenuPluginExtension, SlashMenuPluginExtensionType } from "../slash-menu/slash-menu-plugin.tsx";
import { EmojiPickerOverlay } from "./components/emoji-picker-overlay.tsx";
import { appendOverlay } from "../../core/editor-engine/index.ts";
import { Plugin } from "../../core/plugin-engine/plugin.ts";
import { SelectionUtils } from "../../utils/selection-utils.ts";

/**
 * Example plugin that extends the SlashMenu.
 *
 * Implements `SlashMenuPluginExtension` to appear as a custom item in the menu.
 * When selected, inserts an emoji picker into the editor.
 */
export class EmojiPlugin extends Plugin implements SlashMenuPluginExtension {

    sort: number = 3;
    range: Range | null = null;
    /**
     * Discriminator used by the system to identify this plugin as a SlashMenu extension.
     * Must be set to `SLASH_MENU_PLUGIN_TYPE`.
     */
    public readonly type = SlashMenuPluginExtensionType;

    label: string = "Emoji Picker";

    onSelect(): void {
        appendOverlay(
            <EmojiPickerOverlay range={this.range} />
        );
    }

    onMounted(): void {
        this.range = SelectionUtils.getCurrentSelectionRange();
    }

    override setup(_root: HTMLElement): void {
        // No setup required for this extension plugin.
    }


}