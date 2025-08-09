/** @jsx h */

import { BoldIcon, ItalicIcon, StrikeThroughIcon, UnderlineIcon } from "../../design-system/components/icons.tsx";
import { h, ExtensiblePlugin, PluginExtension, EventTypes, KeyboardKeys, appendElementOnOverlayArea, debounce, hasSelection } from "../index.ts";
import { FormattingToolbarItem } from "./component/formatting-toolbar-item.tsx";
import { FormattingToolbar } from "./component/formatting-toolbar.tsx";

export class FormattingToolbarPlugin extends ExtensiblePlugin<FormattingToolbarExtensionPlugin> {

    private static toolbarInstance: HTMLElement | null = null;
    private extensionPlugins: FormattingToolbarExtensionPlugin[] = [];

    override attachExtensions(extensions: FormattingToolbarExtensionPlugin[]): void {

        this.extensionPlugins = extensions ?? [];

        document.addEventListener(EventTypes.MouseUp, debounce(() => this.handleSelection(), 100) as EventListener);

        document.addEventListener(EventTypes.KeyUp, debounce((event: KeyboardEvent) => {
            if (event.key === KeyboardKeys.Shift) {
                this.handleSelection();
            }
        }, 100) as EventListener);
    }

    removeInstance(): void {
        FormattingToolbarPlugin.toolbarInstance = null;
    }

    private handleSelection(): void {
        if (!FormattingToolbarPlugin.toolbarInstance && hasSelection()) {

            const formattingToolbar =
                <FormattingToolbar removeInstance={this.removeInstance}>
                    {this.buildToolbarItems().map(item => (
                        <li>
                            <FormattingToolbarItem
                                icon={item.icon}
                                tooltip={item.tooltip}
                                onSelect={item.onSelect}
                                command={item.command}
                            />
                        </li>
                    ))}
                </FormattingToolbar>;

            appendElementOnOverlayArea(formattingToolbar);
            FormattingToolbarPlugin.toolbarInstance = formattingToolbar;
        }
    }

    private readonly defaultItems: ToolbarEntry[] = [
        {
            icon: <BoldIcon />,
            tooltip: "Bold",
            onSelect: () => document.execCommand("bold"),
            command: "bold",
            sort: 10,
        },
        {
            icon: <ItalicIcon />,
            tooltip: "Italic",
            onSelect: () => document.execCommand("italic"),
            command: "italic",
            sort: 20,
        },
        {
            icon: <StrikeThroughIcon />,
            tooltip: "Strikethrough",
            onSelect: () => document.execCommand("strikeThrough"),
            command: "strikeThrough",
            sort: 30,
        },
        {
            icon: <UnderlineIcon />,
            tooltip: "Underline",
            onSelect: () => document.execCommand("underline"),
            command: "underline",
            sort: 40,
        },
    ];

    private buildToolbarItems(): ToolbarEntry[] {
        const itemsFromExtensions: ToolbarEntry[] = this.extensionPlugins.map(
            (ext) => ({
                icon: ext.icon,
                tooltip: ext.tooltip,
                onSelect: () => ext.onSelect(),
                sort: ext.sort,
                command: ext.command,
            }),
        );

        return [...this.defaultItems, ...itemsFromExtensions].sort(
            (a, b) => a.sort - b.sort,
        );
    }
}

export abstract class FormattingToolbarExtensionPlugin extends PluginExtension<FormattingToolbarPlugin> {

    override readonly target = FormattingToolbarPlugin;

    abstract readonly icon: SVGElement;
    abstract readonly tooltip: string;
    abstract readonly sort: number;
    abstract onSelect(): void;
    command?: string;
}

type ToolbarEntry = {
    icon: SVGElement;
    tooltip: string;
    sort: number;
    onSelect: () => void;
    command?: string;
};