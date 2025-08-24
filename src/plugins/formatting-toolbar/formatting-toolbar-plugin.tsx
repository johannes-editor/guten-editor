/** @jsx h */

import { provideContext } from "../../core/context/context.ts";
import { BoldIcon, ItalicIcon, StrikeThroughIcon, UnderlineIcon } from "../../design-system/components/icons.tsx";
import { h, ExtensiblePlugin, PluginExtension, appendElementOnOverlayArea, debounce, hasSelection, runCommand, Plugin } from "../index.ts";
import { FormattingToolbarItem } from "./component/formatting-toolbar-item.tsx";
import { FormattingToolbar } from "./component/formatting-toolbar.tsx";
import { FormattingToolbarCtx } from "./formatting-toolbar-context.ts";

import { dom, keyboard } from "../index.ts";

export class FormattingToolbarPlugin extends ExtensiblePlugin<FormattingToolbarExtensionPlugin> {

    private static toolbarInstance: FormattingToolbar | null = null;
    private extensionPlugins: FormattingToolbarExtensionPlugin[] = [];

    override setup(_root: HTMLElement, _plugins: Plugin[]): void {
        
        provideContext(_root, FormattingToolbarCtx, {

            lock: () => FormattingToolbarPlugin.toolbarInstance?.lockSelection(),
            unlock: () => FormattingToolbarPlugin.toolbarInstance?.unlockSelection(),
           
        }, { scopeRoot: _root });
    }

    override attachExtensions(extensions: FormattingToolbarExtensionPlugin[]): void {

        this.extensionPlugins = extensions ?? [];

        document.addEventListener(dom.EventTypes.MouseUp, debounce(() => this.handleSelection(), 100) as EventListener);

        document.addEventListener(dom.EventTypes.KeyUp, debounce((event: KeyboardEvent) => {
            if (event.key === keyboard.KeyboardKeys.Shift) {
                this.handleSelection();
            }
        }, 100) as EventListener);
    }

    removeInstance(): void {
        FormattingToolbarPlugin.toolbarInstance = null;
    }

    private handleSelection(): void {

        let ft: FormattingToolbar | null = null;

        if (!FormattingToolbarPlugin.toolbarInstance && hasSelection()) {

            const formattingToolbar =
                <FormattingToolbar removeInstance={this.removeInstance} ref={(el: FormattingToolbar) => ft = el}>
                    {this.buildToolbarItems().map(item => (
                        <li>
                            <FormattingToolbarItem
                                icon={item.icon}
                                tooltip={item.tooltip}
                                onSelect={item.onSelect}
                                isActive={item.isActive}
                                refreshSelection={() => ft?.refreshSelection()}
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
            onSelect: () => runCommand("toggleBold"),
            isActive: () => runCommand("stateBold"),
            sort: 10,
        },
        {
            icon: <ItalicIcon />,
            tooltip: "Italic",
            onSelect: () => runCommand("toggleItalic"),
            isActive: () => runCommand("stateItalic"),
            sort: 20,
        },
        {
            icon: <StrikeThroughIcon />,
            tooltip: "Strikethrough",
            onSelect: () => runCommand("toggleStrike"),
            isActive: () => runCommand("stateStrike"),
            sort: 30,
        },
        {
            icon: <UnderlineIcon />,
            tooltip: "Underline",
            onSelect: () => runCommand("toggleUnderline"),
            isActive: () => runCommand("stateUnderline"),
            sort: 40,
        },
    ];

    private buildToolbarItems(): ToolbarEntry[] {
        const itemsFromExtensions: ToolbarEntry[] = this.extensionPlugins.map(
            (ext) => ({
                icon: ext.icon,
                tooltip: ext.tooltip,
                onSelect: () => ext.onSelect(),
                isActive: ext.isActive,
                sort: ext.sort,
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
    isActive: () => boolean = () => { return false; };
}

type ToolbarEntry = {
    icon: SVGElement;
    tooltip: string;
    sort: number;
    onSelect: () => void;
    isActive: () => boolean;
};