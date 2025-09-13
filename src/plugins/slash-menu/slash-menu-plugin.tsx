/** @jsx h */

import { h, Plugin, ExtensiblePlugin, PluginExtension, registerTranslation, appendElementOnOverlayArea } from "../index.ts";

import { SlashMenuOverlay } from "./components/slash-menu.tsx";
import { SlashMenuItemData } from "./components/types.ts";

import { en } from "./i18n/en.ts";
import { pt } from "./i18n/pt.ts";
import { defaultSlashMenuItems } from "./default-items.tsx";

import { dom, keyboard } from "../index.ts";


/**
 * The SlashMenuPlugin is an EditorPlugin that integrates a SlashMenu into the editor interface.
 *
 * - The SlashMenu appears when the user triggers a keyboard shortcut (such as pressing the "/" key), and can be hidden the same way.
 * - Menu items allow users to quickly run actions and commands.
 * - You can extend the SlashMenu by creating plugins that implement the `SlashMenuPluginExtension` interface—just provide a `label` and an `onSelect()` function, and your plugin will automatically appear as a menu option.
 */
export class SlashMenuPlugin extends ExtensiblePlugin<SlashMenuExtensionPlugin> {

    override attachExtensions(extensions: SlashMenuExtensionPlugin[]): void {

        // extensions.map( e => e.setup(_root, extensions));
        const items: SlashMenuItemData[] = extensions.map((ext) => ({
            icon: ext.icon,
            label: ext.label,
            sort: ext.sort,
            onSelect: (currentBlock: HTMLElement) => ext.onSelect(currentBlock),
        }));

        document.addEventListener(dom.EventTypes.KeyDown, (event) => this.handleKey(event, items));
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
        if (event.key === keyboard.KeyboardKeys.Slash && !this.mounted()) {

            // Prevent Firefox from opening the "Quick Find" bar when pressing the "/" key
            event.preventDefault();
            event.stopImmediatePropagation();


            // Insert "/" manually at caret position
            const selection = globalThis.getSelection();
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

export abstract class SlashMenuExtensionPlugin extends PluginExtension<SlashMenuPlugin> {

    override readonly target = SlashMenuPlugin;
    abstract readonly icon: SVGElement;
    abstract readonly label: string;
    abstract readonly sort: number;
    abstract onSelect(currentBlock: HTMLElement): void;
}