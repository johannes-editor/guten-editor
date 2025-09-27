/** @jsx h */

import { provideContext } from "../../core/context/context.ts";
import { BoldIcon, ItalicIcon, StrikeThroughIcon, UnderlineIcon } from "../../design-system/components/icons.tsx";
import { h, ExtensiblePlugin, PluginExtension, appendElementOnOverlayArea, debounce, hasSelection, runCommand, Plugin, t } from "../index.ts";
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


        document.addEventListener(dom.EventTypes.KeyUp, debounce((event: KeyboardEvent) => {
            if (event.key === keyboard.KeyboardKeys.ArrowUp || event.key === keyboard.KeyboardKeys.ArrowDown || event.key === keyboard.KeyboardKeys.ArrowLeft || event.key === keyboard.KeyboardKeys.ArrowRight) {
                FormattingToolbarPlugin.toolbarInstance?.remove();
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
                                label={item.label}
                                shortcut={item.shortcut}
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
            label: t("bold"),
            shortcut: "Mod+B",
            onSelect: () => runCommand("toggleBold"),
            isActive: () => runCommand("stateBold"),
            sort: 10,
        },
        {
            icon: <ItalicIcon />,
            label: t("italic"),
            shortcut: "Mod+I",
            onSelect: () => runCommand("toggleItalic"),
            isActive: () => runCommand("stateItalic"),
            sort: 20,
        },
        {
            icon: <StrikeThroughIcon />,
            label: t("strikethrough"),
            shortcut: "Mod+Shift+X",
            onSelect: () => runCommand("toggleStrike"),
            isActive: () => runCommand("stateStrike"),
            sort: 30,
        },
        {
            icon: <UnderlineIcon />,
            label: t("underline"),
            shortcut: "Mod+U",
            onSelect: () => runCommand("toggleUnderline"),
            isActive: () => runCommand("stateUnderline"),
            sort: 40,
        },
    ];

    private buildToolbarItems(): ToolbarEntry[] {
        const itemsFromExtensions: ToolbarEntry[] = this.extensionPlugins.map(
            (ext) => ({
                icon: ext.icon,
                label: ext.label,
                shortcut: ext.shortcut,
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
    abstract readonly label: string;
    abstract readonly shortcut: string;
    abstract readonly sort: number;
    abstract onSelect(): void;
    isActive: () => boolean = () => { return false; };
}

type ToolbarEntry = {
    icon: SVGElement;
    label: string;
    shortcut: string;
    sort: number;
    onSelect: () => void;
    isActive: () => boolean;
};