/** @jsx h */

import { h } from "@core/jsx/index.ts";
import { Plugin, ExtensiblePlugin, PluginExtension } from "@core/plugin-engine/index.ts";
import { registerTranslation } from "@core/i18n/index.ts";
import { appendElementOnOverlayArea } from "@components/editor/core/index.tsx";
import { SlashMenuOverlay } from "./components/slash-menu.tsx";
import { SlashMenuItemData } from "./components/types.ts";
import { en } from "./i18n/en.ts";
import { pt } from "./i18n/pt.ts";
import { defaultSlashMenuItems } from "./default-items.tsx";
import { EventTypes } from "@utils/dom/index.ts";
import { KeyboardKeys } from "@utils/keyboard/index.ts";
import { waitFrames } from "@utils/timing/index.ts";


/**
 * The SlashMenuPlugin is an EditorPlugin that integrates a SlashMenu into the editor interface.
 *
 * - The SlashMenu appears when the user triggers a keyboard shortcut (such as pressing the "/" key), and can be hidden the same way.
 * - Menu items allow users to quickly run actions and commands.
 * - You can extend the SlashMenu by creating plugins that implement the `SlashMenuPluginExtension` interface—just provide a `label` and an `onSelect()` function, and your plugin will automatically appear as a menu option.
 */
export class SlashMenuPlugin extends ExtensiblePlugin<SlashMenuExtensionPlugin> {

    private contentArea: HTMLElement | null = null;

    override attachExtensions(extensions: SlashMenuExtensionPlugin[]): void {

        // extensions.map( e => e.setup(_root, extensions));
        const items: SlashMenuItemData[] = extensions.map((ext) => ({
            icon: ext.icon,
            label: ext.label,
            shortcut: ext.shortcut,
            sort: ext.sort,
            synonyms: ext.synonyms,
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
    override setup(root: HTMLElement, _plugins: Plugin[]): void {

        this.contentArea = root.querySelector<HTMLElement>("#contentArea") ??
            root.querySelector<HTMLElement>('[contenteditable="true"]');

        registerTranslation("en", en);
        registerTranslation("pt", pt);
    }

    private readonly handleKey = async (event: KeyboardEvent, extensionItems: SlashMenuItemData[]) => {
        if (event.key === KeyboardKeys.Slash && !this.mounted() && event.shiftKey === false && event.ctrlKey === false && event.altKey === false && event.metaKey === false) {
            const selection = globalThis.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const contentArea = this.getContentArea();
            if (contentArea) {
                const { startContainer } = selection.getRangeAt(0);
                if (!contentArea.contains(startContainer)) return;
            }

            event.preventDefault();
            event.stopImmediatePropagation();

            await waitFrames(2);

            const refreshedSelection = globalThis.getSelection();
            if (refreshedSelection && refreshedSelection.rangeCount > 0) {
                const range = refreshedSelection.getRangeAt(0);

                const slashNode = document.createTextNode("/");
                range.insertNode(slashNode);

                range.setStartAfter(slashNode);
                range.setEndAfter(slashNode);
                refreshedSelection.removeAllRanges();
                refreshedSelection.addRange(range);

                await waitFrames(2);

                const slashMenuItems = defaultSlashMenuItems();
                slashMenuItems.push(...extensionItems);

                appendElementOnOverlayArea(
                    <SlashMenuOverlay
                        items={slashMenuItems}
                        anchorNode={slashNode}
                    />
                );
            }
        }
    }

    private mounted(): boolean {
        return document.getElementsByTagName(SlashMenuOverlay.getTagName()).length > 0;
    }

    private getContentArea(): HTMLElement | null {
        if (this.contentArea && document.contains(this.contentArea)) {
            return this.contentArea;
        }

        this.contentArea = document.getElementById("contentArea");
        return this.contentArea;
    }
}

export abstract class SlashMenuExtensionPlugin extends PluginExtension<SlashMenuPlugin> {

    override readonly target = SlashMenuPlugin;
    abstract readonly icon: SVGElement;
    abstract readonly label: string;
    abstract readonly sort: number;

    readonly shortcut?: string = undefined;
    readonly synonyms?: string[] = undefined;

    abstract onSelect(currentBlock: HTMLElement): void;
}