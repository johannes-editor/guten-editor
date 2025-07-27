/** @jsx h */
import { h } from "../../jsx.ts";
import { EventTypes } from "../../constants/event-types.ts";
import { KeyboardKeys } from "../../constants/keyboard-keys.ts";
import { SlashMenuOverlay } from "./components/slash-menu.tsx";
import { Plugin } from "../../core/plugin-engine/plugin.ts";
import { DomUtils } from "../../utils/dom-utils.ts";
import { ClassName } from "../../constants/class-name.ts";
import { SlashMenuItemData } from "./components/types.ts";
import { appendElementOnOverlayArea } from "../../core/editor-engine/index.ts";
import { Paragraph } from "../../components/blocks/paragraph.tsx";
import { Heading1 } from "../../components/blocks/header1.tsx";
import { Heading2 } from "../../components/blocks/header2.tsx";
import { Heading3 } from "../../components/blocks/header3.tsx";
import { Heading4 } from "../../components/blocks/header4.tsx";
import { Heading5 } from "../../components/blocks/header5.tsx";
import { Blockquote } from "../../components/blocks/blockquote.tsx";
import { BulletedList } from "../../components/blocks/bulleted-list.tsx";
import { NumberedList } from "../../components/blocks/numbered-list.tsx";
import { registerTranslation, t } from "../../core/i18n/index.ts";

import { en } from "./i18n/en.ts";
import pt from "./i18n/pt.ts";
import { defaultSlashMenuItems } from "./default-items.tsx";

/**
 * String literal used as a type discriminator for SlashMenu extension plugins.
 */
export const SlashMenuPluginExtensionType = "slash-menu-plugin-extension-type" as const;


/**
 * The SlashMenuPlugin is an EditorPlugin that integrates a SlashMenu into the editor interface.
 *
 * - The SlashMenu appears when the user triggers a keyboard shortcut (such as pressing the "/" key), and can be hidden the same way.
 * - Menu items allow users to quickly run actions and commands.
 * - You can extend the SlashMenu by creating plugins that implement the `SlashMenuPluginExtension` interface—just provide a `label` and an `onSelect()` function, and your plugin will automatically appear as a menu option.
 */
export class SlashMenuPlugin extends Plugin {

    /**
    * Initializes the plugin by appending a SlashMenu to the editor root,
    * including all extension plugins that match the required interface.
    *
    * @param root The editor's root HTMLElement.
    * @param plugins The list of all loaded editor plugins.
    */
    override setup(_root: HTMLElement, plugins: Plugin[]): void {

        registerTranslation("en", en);
        registerTranslation("pt", pt);

        const extensionPlugins = plugins.filter(isSlashMenuPluginExtension);

        const slashMenuItems: SlashMenuItemData[] = [];

        for (const plugin of extensionPlugins) {
            slashMenuItems.push({
                sort: plugin.sort || 99,
                label: plugin.label,
                onSelect: () => plugin.onSelect(),
                synonyms: plugin.synonyms || [],
            });
        }

        document.addEventListener(EventTypes.KeyDown, (event) => this.handleKey(event, slashMenuItems));
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


            const block = DomUtils.findClosestAncestorOfSelectionByClass(ClassName.Block);
            const slashMenuItems = defaultSlashMenuItems(block);
            slashMenuItems.push(...extensionItems);

            appendElementOnOverlayArea(<SlashMenuOverlay items={slashMenuItems} />);
        }
    }

    private mounted(): boolean {
        return document.getElementsByTagName(SlashMenuOverlay.getTagName()).length > 0;
    }

    
}

/**
 * Interface for plugins that can extend the SlashMenu.
 * Plugins implementing this interface will be shown as items in the slash menu.
 */
export interface SlashMenuPluginExtension {
    /** Discriminator for identifying plugins that implements SlashMenuPluginExtension */
    type: typeof SlashMenuPluginExtensionType;

    sort: number;
    /** The display label for the menu item */
    label: string;
    /** The handler invoked when the menu item is selected */
    onSelect(): void;
    /** 
    * Callback invoked when the SlashMenu is mounted in the editor.
    * Use this to perform any setup or side effects needed by the plugin when the menu appears.
    */
    // onMounted(): void;

    /** Used by filter */
    synonyms?: string[];
}

/**
 * Type guard to check if a plugin implements SlashMenuPluginExtension.
 * @param plugin The plugin to check.
 * @returns True if the plugin implements the required interface.
 */
function isSlashMenuPluginExtension(plugin: Plugin): plugin is Plugin & SlashMenuPluginExtension {
    return (
        "type" in plugin && plugin["type"] === SlashMenuPluginExtensionType &&
        "label" in plugin && typeof plugin["label"] === "string" &&
        "onSelect" in plugin && typeof plugin["onSelect"] === "function"
    );
}