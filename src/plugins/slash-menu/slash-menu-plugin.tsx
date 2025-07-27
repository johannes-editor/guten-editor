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
import { ParagraphFn } from "../../components/blocks/paragraph-fn.tsx";
import { Heading1Fn } from "../../components/blocks/header1-fn.tsx";
import { Heading2Fn } from "../../components/blocks/header2-fn.tsx";
import { Heading3Fn } from "../../components/blocks/header3-fn.tsx";
import { Heading4Fn } from "../../components/blocks/header4-fn.tsx";
import { Heading5Fn } from "../../components/blocks/header5-fn.tsx";
import { BlockquoteFn } from "../../components/blocks/blockquote-fn.tsx";
import { BulletedListFn } from "../../components/blocks/bulleted-list-fn.tsx";
import { NumberedListFn } from "../../components/blocks/numbered-list-fn.tsx";
import { registerTranslation, t } from "../../core/i18n/index.ts";

import { en } from "./i18n/en.ts";
import pt from "./i18n/pt.ts";

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
            const slashMenuItems = this.getBaseItems(block);
            slashMenuItems.push(...extensionItems);

            appendElementOnOverlayArea(<SlashMenuOverlay items={slashMenuItems} />);
        }
    }

    private mounted(): boolean {
        return document.getElementsByTagName(SlashMenuOverlay.getTagName()).length > 0;
    }

    private getBaseItems(block: HTMLElement | null): SlashMenuItemData[] {
        return [
            {
                sort: 1,
                label: t("paragraph"),
                synonyms: [t("paragraph"), t("text")],
                onSelect: () => {
                    const element = DomUtils.insertElementAfter(block, <ParagraphFn />);
                    DomUtils.focusOnElement(element);
                }
            },
            {
                sort: 2,
                label: t("heading_1"),
                synonyms: [t("title"), "h1"],
                onSelect: () => {
                    const element = DomUtils.insertElementAfter(block, <Heading1Fn />);
                    DomUtils.focusOnElement(element);
                }
            },
            {
                sort: 3,
                label: t("heading_2"),
                synonyms: [t("title"), "h2"],
                onSelect: () => {
                    const element = DomUtils.insertElementAfter(block, <Heading2Fn />);
                    DomUtils.focusOnElement(element);
                }
            },
            {
                sort: 4,
                label: t("heading_3"),
                synonyms: [t("title"), "h3"],
                onSelect: () => {
                    const element = DomUtils.insertElementAfter(block, <Heading3Fn />);
                    DomUtils.focusOnElement(element);
                }
            },
            {
                sort: 5,
                label: t("heading_4"),
                synonyms: [t("title"), "h4"],
                onSelect: () => {
                    const element = DomUtils.insertElementAfter(block, <Heading4Fn />);
                    DomUtils.focusOnElement(element);
                }
            },
            {
                sort: 6,
                label: t("heading_5"),
                synonyms: [t("title"), "h5"],
                onSelect: () => {
                    const element = DomUtils.insertElementAfter(block, <Heading5Fn />);
                    DomUtils.focusOnElement(element);
                }
            },
            {
                sort: 7,
                label: t("quotation"),
                synonyms: ["cite", "blockquote"],
                onSelect: () => {
                    const element = DomUtils.insertElementAfter(block, <BlockquoteFn />)
                    DomUtils.focusOnElement(element);
                }
            },
            {
                sort: 7,
                label: t("bulleted_list"),
                synonyms: [t("list"), t("bulleted_list")],
                onSelect: () => {
                    const element = DomUtils.insertElementAfter(block, <BulletedListFn />)
                    const item = element.querySelector("li");
                    DomUtils.focusOnElement(item);
                }
            },
            {
                sort: 7,
                label: t("numbered_list"),
                synonyms: [t("list"), t("numbered"), t("ordered")],
                onSelect: () => {
                    const element = DomUtils.insertElementAfter(block, <NumberedListFn />)
                    const item = element.querySelector("li");
                    DomUtils.focusOnElement(item);
                }
            }

        ];
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