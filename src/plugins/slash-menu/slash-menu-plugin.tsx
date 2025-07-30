/** @jsx h */
import { h } from "../../jsx.ts";
import { EventTypes } from "../../constants/event-types.ts";
import { KeyboardKeys } from "../../constants/keyboard-keys.ts";
import { SlashMenuOverlay } from "./components/slash-menu.tsx";
import { Plugin } from "../../core/plugin-engine/plugin.ts";
import { SlashMenuItemData } from "./components/types.ts";
import { appendElementOnOverlayArea } from "../../core/editor-engine/index.ts";
import { registerTranslation, t } from "../../core/i18n/index.ts";
import { en } from "./i18n/en.ts";
import { pt } from "./i18n/pt.ts";
import { defaultSlashMenuItems } from "./default-items.tsx";
import { ExtensiblePlugin } from "../../core/plugin-engine/extensible-plugin.ts";
import { PluginExtension } from "../../core/plugin-engine/plugin-extension.ts";

/**
 * The SlashMenuPlugin is an EditorPlugin that integrates a SlashMenu into the editor interface.
 *
 * - The SlashMenu appears when the user triggers a keyboard shortcut (such as pressing the "/" key), and can be hidden the same way.
 * - Menu items allow users to quickly run actions and commands.
 * - You can extend the SlashMenu by creating plugins that implement the `SlashMenuPluginExtension` interface—just provide a `label` and an `onSelect()` function, and your plugin will automatically appear as a menu option.
 */
export class SlashMenuPlugin extends ExtensiblePlugin<SlashMenuExtensionPlugin> {

    override initialize(_root: HTMLElement, extensions: SlashMenuExtensionPlugin[]): void {

        // extensions.map( e => e.setup(_root, extensions));
        const items: SlashMenuItemData[] = extensions.map((ext) => ({
            label: ext.label,
            sort: ext.sort,
            onSelect: (currentBlock: HTMLElement) => ext.onSelect(currentBlock),
        }));

        document.addEventListener(EventTypes.KeyDown, (event) => this.handleKey(event, items));
    }

    /**
    * Initializes the plugin by appending a SlashMenu to the editor root,
    * including all extension plugins that match the required interface.
    *
    * @param root The editor's root HTMLElement.
    * @param plugins The list of all loaded editor plugins.
    */
    override setup(_root: HTMLElement, _plugins: Plugin[]): void {

        registerTranslation("en", en);
        registerTranslation("pt", pt);
    }

    private readonly handleKey = (event: KeyboardEvent, extensionItems: SlashMenuItemData[]) => {
        if (event.key === KeyboardKeys.Slash && !this.mounted()) {

            // Prevent Firefox from opening the "Quick Find" bar when pressing the "/" key
            event.preventDefault();
            event.stopImmediatePropagation();


            // Insert "/" manually at caret position
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const slashNode = document.createTextNode("/");

                range.insertNode(slashNode);

                // Move caret after the inserted slash
                range.setStartAfter(slashNode);
                range.setEndAfter(slashNode);
                selection.removeAllRanges();
                selection.addRange(range);
            }           

            const slashMenuItems = defaultSlashMenuItems();
            slashMenuItems.push(...extensionItems);

            appendElementOnOverlayArea(<SlashMenuOverlay items={slashMenuItems} />);
        }
    }

    private mounted(): boolean {
        return document.getElementsByTagName(SlashMenuOverlay.getTagName()).length > 0;
    }
}

PluginExtension


export abstract class SlashMenuExtensionPlugin extends PluginExtension<SlashMenuPlugin> {

    override readonly target = SlashMenuPlugin;

    abstract readonly label: string;
    abstract readonly sort: number;
    abstract onSelect(currentBlock: HTMLElement): void;
}