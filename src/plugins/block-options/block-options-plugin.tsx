/** @jsx h */
import { h, ExtensiblePlugin, appendElementOnOverlayArea, runCommand, t } from "../index.ts";
import { BlockOptions } from "../drag-and-drop/components/block-options.tsx";
import { BlockOptionsItem } from "../drag-and-drop/components/block-options-item.tsx";
import { ArrowDownIcon, ArrowUpIcon, CopyIcon, TrashIcon } from "../../design-system/components/icons.tsx";
import { PluginExtension } from "../../core/plugin-engine/plugin-extension.ts";

export interface BlockOptionsItemContext {
    block: HTMLElement;
    blockOptions: HTMLElement;
    close: () => void;
}

export interface BlockOptionsMenuItem {
    id: string;
    icon?: Element;
    label: string | ((block: HTMLElement) => string);
    sort?: number;
    isActive?: (block: HTMLElement) => boolean;
    isVisible?: (block: HTMLElement) => boolean;
    onSelect: (context: BlockOptionsItemContext) => void;
}

export class BlockOptionsPlugin extends ExtensiblePlugin<BlockOptionsExtensionPlugin> {

    private static instance: BlockOptionsPlugin | null = null;
    private static currentMenu: HTMLElement | null = null;

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

        const items = this.collectItems(block);
        if (!items.length) return null;

        let menuEl: HTMLElement | null = null;

        menuEl = appendElementOnOverlayArea(
            <BlockOptions>
                {items.map((item) => (
                    <BlockOptionsItem
                        icon={item.icon}
                        label={typeof item.label === "function" ? item.label(block) : item.label}
                        isActive={item.isActive?.(block)}
                        onSelect={() => {
                            if (!menuEl) return;
                            const ctx: BlockOptionsItemContext = {
                                block,
                                blockOptions: menuEl,
                                close: () => {
                                    if (!menuEl) return;
                                    if (menuEl.isConnected) menuEl.remove();
                                    if (BlockOptionsPlugin.currentMenu === menuEl) {
                                        BlockOptionsPlugin.currentMenu = null;
                                    }
                                },
                            };
                            item.onSelect(ctx);
                        }}
                    />
                ))}
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
