/** @jsx h */
import { h, ExtensiblePlugin, appendElementOnOverlayArea, runCommand, t } from "../index.ts";
import { BlockOptions } from "../drag-and-drop/components/block-options.tsx";
import { BlockOptionsItem } from "../drag-and-drop/components/block-options-item.tsx";
import { ArrowDownIcon, ArrowUpIcon, CopyIcon, TrashIcon } from "../../design-system/components/icons.tsx";
import { PluginExtension } from "../../core/plugin-engine/plugin-extension.ts";

export interface BlockOptionsItemContext {
    block: HTMLElement;
    blockOptions: HTMLElement;
    trigger: HTMLElement;
    close: () => void;
    closeSubmenu: () => void;
}

export type BlockOptionsMenuItemType = "item" | "label" | "separator";

export interface BlockOptionsMenuItem {
    id: string;
    type?: BlockOptionsMenuItemType;
    icon?: Element;
    label?: string | ((block: HTMLElement) => string);
    sort?: number;
    isActive?: (block: HTMLElement) => boolean;
    isVisible?: (block: HTMLElement) => boolean;
    onSelect?: (context: BlockOptionsItemContext) => void;
    submenu?: (context: BlockOptionsItemContext) => BlockOptionsMenuItem[];
}

export class BlockOptionsPlugin extends ExtensiblePlugin<BlockOptionsExtensionPlugin> {

    private static instance: BlockOptionsPlugin | null = null;
    private static currentMenu: HTMLElement | null = null;
    private static currentSubmenu: HTMLElement | null = null;

    private extensions: BlockOptionsExtensionPlugin[] = [];

    override setup(_root: HTMLElement): void {
        BlockOptionsPlugin.instance = this;
    }

    override attachExtensions(extensions: BlockOptionsExtensionPlugin[]): void {
        this.extensions = extensions ?? [];
    }

    static openForBlock(block: HTMLElement, rect?: DOMRect | null): HTMLElement | null {
        const plugin = BlockOptionsPlugin.instance;
        if (!plugin) return null;
        return plugin.open(block, rect ?? undefined);
    }

    private open(block: HTMLElement, rect?: DOMRect): HTMLElement | null {
        BlockOptionsPlugin.currentMenu?.remove();
        this.closeSubmenu();

        const items = this.collectItems(block);
        if (!items.length) return null;

        let menuEl: HTMLElement | null = null;

        menuEl = appendElementOnOverlayArea(
            <BlockOptions>
                {items.map((item) => this.renderMenuItem(item, block, () => menuEl))}
            </BlockOptions>
        ) as HTMLElement;

        BlockOptionsPlugin.currentMenu = menuEl;

        if (rect) {
            menuEl.style.top = `${rect.top}px`;
            menuEl.style.left = `${rect.right + 8}px`;
        }

        return menuEl;
    }

    private collectItems(block: HTMLElement): BlockOptionsMenuItem[] {
        const baseItems = this.defaultItems();
        const extensionItems = this.extensions.flatMap((ext) => ext.items(block));
        const all = [...baseItems, ...extensionItems];

        return all
            .filter((item) => item.isVisible ? item.isVisible(block) : true)
            .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
    }

    private renderMenuItem(item: BlockOptionsMenuItem, block: HTMLElement, getMenuEl: () => HTMLElement | null): Element {
        if (item.type === "separator") {
            return <hr class="guten-menu-separator" data-block-options-id={item.id} />;
        }

        if (item.type === "label") {
            const labelValue = typeof item.label === "function" ? item.label(block) : item.label ?? "";
            return (
                <div class="guten-menu-label" data-block-options-id={item.id}>
                    {labelValue}
                </div>
            );
        }

        const labelValue = typeof item.label === "function" ? item.label(block) : item.label ?? "";

        return (
            <BlockOptionsItem
                icon={item.icon}
                label={labelValue}
                isActive={item.isActive?.(block)}
                data-block-options-id={item.id}
                hasSubmenu={item.submenu ? true : undefined}
                onSelect={(event: Event) => {
                    const menu = getMenuEl();
                    if (!menu) return;
                    const trigger = this.resolveTrigger(event);
                    if (!trigger) return;

                    const ctx: BlockOptionsItemContext = {
                        block,
                        blockOptions: menu,
                        trigger,
                        close: () => {
                            const current = getMenuEl();
                            if (!current) return;
                            if (current.isConnected) current.remove();
                            if (BlockOptionsPlugin.currentMenu === current) {
                                BlockOptionsPlugin.currentMenu = null;
                                this.closeSubmenu();
                            }
                            if (BlockOptionsPlugin.currentSubmenu === current) {
                                BlockOptionsPlugin.currentSubmenu = null;
                            }
                        },
                        closeSubmenu: () => this.closeSubmenu(),
                    };

                    if (item.onSelect) {
                        item.onSelect(ctx);
                    }

                    if (item.submenu) {
                        const submenuItems = item.submenu(ctx) ?? [];
                        this.openSubmenu(submenuItems, block, trigger);
                    } else {
                        this.closeSubmenu();
                    }
                }}
            />
        );
    }

    private resolveTrigger(event: Event): HTMLElement | null {
        if (!(event instanceof Event)) return null;
        const target = event.target instanceof HTMLElement ? event.target : null;
        const button = target?.closest("button");
        if (button) return button as HTMLElement;
        if (event.currentTarget instanceof HTMLElement) {
            const fallback = event.currentTarget.querySelector("button");
            if (fallback) return fallback as HTMLElement;
        }
        return null;
    }

    private openSubmenu(items: BlockOptionsMenuItem[], block: HTMLElement, trigger: HTMLElement): void {
        this.closeSubmenu();
        if (!items.length) return;

        let submenuEl: HTMLElement | null = null;

        submenuEl = appendElementOnOverlayArea(
            <BlockOptions keyboardNavigation={false}>
                {items.map((item) => this.renderMenuItem(item, block, () => submenuEl))}
            </BlockOptions>
        ) as HTMLElement;

        const rect = trigger.getBoundingClientRect();
        submenuEl.style.top = `${rect.top}px`;
        submenuEl.style.left = `${rect.right + 8}px`;

        BlockOptionsPlugin.currentSubmenu = submenuEl;
    }

    private closeSubmenu(): void {
        if (BlockOptionsPlugin.currentSubmenu) {
            const submenu = BlockOptionsPlugin.currentSubmenu;
            BlockOptionsPlugin.currentSubmenu = null;
            if (submenu.isConnected) submenu.remove();
        }
    }

    private defaultItems(): BlockOptionsMenuItem[] {
        return [
            {
                id: "duplicateBlock",
                icon: <CopyIcon />,
                label: t("duplicate"),
                sort: 10,
                onSelect: ({ block, blockOptions }) => {
                    runCommand("duplicateBlock", { content: { block, blockOptions } });
                },
            },
            {
                id: "moveBlockUp",
                icon: <ArrowUpIcon />,
                label: t("move_up"),
                sort: 20,
                onSelect: ({ block, blockOptions }) => {
                    runCommand("moveBlockUp", { content: { block, blockOptions } });
                },
            },
            {
                id: "moveBlockDown",
                icon: <ArrowDownIcon />,
                label: t("move_down"),
                sort: 30,
                onSelect: ({ block, blockOptions }) => {
                    runCommand("moveBlockDown", { content: { block, blockOptions } });
                },
            },
            {
                id: "deleteBlock",
                icon: <TrashIcon />,
                label: t("delete"),
                sort: 40,
                onSelect: ({ block, blockOptions }) => {
                    runCommand("deleteBlock", { content: { block, blockOptions } });
                },
            },
        ];
    }
}

export abstract class BlockOptionsExtensionPlugin extends PluginExtension<BlockOptionsPlugin> {
    override readonly target = BlockOptionsPlugin;

    abstract items(block: HTMLElement): BlockOptionsMenuItem[];
}
