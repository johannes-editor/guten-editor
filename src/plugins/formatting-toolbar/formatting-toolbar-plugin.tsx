/** @jsx h */

import { provideContext } from "../../core/context/context.ts";
import { h, ExtensiblePlugin, PluginExtension, appendElementOnOverlayArea, debounce, hasSelection, runCommand, Plugin, t, icons } from "../index.ts";
import { FormattingToolbarItem } from "./component/formatting-toolbar-item.tsx";
import { FormattingToolbar } from "./component/formatting-toolbar.tsx";
import { FormattingToolbarCtx } from "./formatting-toolbar-context.ts";
import { COLOR_TOOLBAR_ITEM_ID } from "./component/constants.ts";
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
                                dataId={item.id}
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
            icon: <icons.BoldIcon />,
            label: t("bold"),
            shortcut: "Mod+B",
            onSelect: () => runCommand("toggleBold"),
            isActive: () => runCommand("stateBold"),
            sort: 10,
        },
        {
            icon: <icons.ItalicIcon />,
            label: t("italic"),
            shortcut: "Mod+I",
            onSelect: () => runCommand("toggleItalic"),
            isActive: () => runCommand("stateItalic"),
            sort: 20,
        },
        {
            icon: <icons.StrikeThroughIcon />,
            label: t("strikethrough"),
            shortcut: "Mod+Shift+X",
            onSelect: () => runCommand("toggleStrike"),
            isActive: () => runCommand("stateStrike"),
            sort: 30,
        },
        {
            icon: <icons.UnderlineIcon />,
            label: t("underline"),
            shortcut: "Mod+U",
            onSelect: () => runCommand("toggleUnderline"),
            isActive: () => runCommand("stateUnderline"),
            sort: 40,
        },
        {
            id: COLOR_TOOLBAR_ITEM_ID,
            icon: <icons.HighlightColorIcon />,
            label: t("highlight_color"),
            shortcut: "",
            onSelect: (event?: Event, button?: HTMLButtonElement | null) => {
                runCommand("openFormattingToolbarHighlightColorMenu", {
                    event,
                    target: button ?? undefined,
                    content: { anchor: button ?? undefined },
                });
            },
            isActive: () => false,
            sort: 45,
        },
        {
            id: COLOR_TOOLBAR_ITEM_ID,
            icon: <icons.TextColorIcon />,
            label: t("text_color"),
            shortcut: "",
            onSelect: (event?: Event, button?: HTMLButtonElement | null) => {
                runCommand("openFormattingToolbarForeColorMenu", {
                    event,
                    target: button ?? undefined,
                    content: { anchor: button ?? undefined },
                });
            },
            isActive: () => false,
            sort: 46,
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
    id?: string;
    icon: SVGElement;
    label: string;
    shortcut: string;
    sort: number;
    onSelect: (event?: Event, button?: HTMLButtonElement | null) => void;
    isActive: () => boolean;
};