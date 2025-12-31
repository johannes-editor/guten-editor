/** @jsx h */
import { h, Plugin, ExtensiblePlugin, PluginExtension, appendElementOnOverlayArea } from "../index.ts";
import { EditorSettingsMenu } from "./components/editor-settings-menu.tsx";
import type { EditorSettingsItemData } from "./types.ts";
import { setEditorSettingsItems } from "./editor-settings-registry.ts";

export class EditorSettingsPlugin extends ExtensiblePlugin<EditorSettingsExtensionPlugin> {
    private items: EditorSettingsItemData[] = [];

    override attachExtensions(extensions: EditorSettingsExtensionPlugin[]): void {
        this.items = extensions.map((ext) => ({
            icon: ext.icon,
            label: ext.label,
            sort: ext.sort,
            rightIndicator: ext.rightIndicator,
            onSelect: (anchor: HTMLElement, menu: HTMLElement) => ext.onSelect(anchor, menu),
        }));

        setEditorSettingsItems(this.items);
    }

    override setup(_root: HTMLElement, _plugins: Plugin[]): void {}

    open(anchor: HTMLElement): void {
        appendElementOnOverlayArea(<EditorSettingsMenu anchor={anchor} items={this.items} />);
    }
}

export abstract class EditorSettingsExtensionPlugin extends PluginExtension<EditorSettingsPlugin> {
    override readonly target = EditorSettingsPlugin;
    abstract readonly label: string;
    abstract readonly sort: number;
    readonly icon?: Element;
    readonly rightIndicator?: "auto" | "check" | "chevron" | "none";
    abstract onSelect(anchor: HTMLElement, menu: HTMLElement): boolean | void;
}