/** @jsx h */
import { h, ExtensiblePlugin, appendElementOnOverlayArea, runCommand, t } from "../index.ts";
import { BlockOptions } from "../drag-and-drop/components/block-options.tsx";
import { BlockOptionsItem } from "../drag-and-drop/components/block-options-item.tsx";
import { ArrowDownIcon, ArrowUpIcon, CopyIcon, TrashIcon } from "../../design-system/components/icons.tsx";
import { PluginExtension } from "../../core/plugin-engine/plugin-extension.ts";

export interface BlockOptionsItemContext {
    block: HTMLElement;
    blockOptions: HTMLElement;
    menuComponent: BlockOptions | null;
    trigger: HTMLElement;
    close: () => void;
    closeOverlay: () => void;
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
    overlay?: (context: BlockOptionsItemContext) => Element | null;
}

export class BlockOptionsPlugin extends ExtensiblePlugin<BlockOptionsExtensionPlugin> {

    private static instance: BlockOptionsPlugin | null = null;
    private static currentMenu: BlockOptions | null = null;
    private static currentOverlay: HTMLElement | null = null;

    private overlayParentMenu: BlockOptions | null = null;
    private overlayRemovalObserver: MutationObserver | null = null;

    private extensions: BlockOptionsExtensionPlugin[] = [];

    override setup(_root: HTMLElement): void {
        BlockOptionsPlugin.instance = this;
    }

    override attachExtensions(extensions: BlockOptionsExtensionPlugin[]): void {
        this.extensions = extensions ?? [];
    }

    static openForBlock(block: HTMLElement, rect?: DOMRect | null): BlockOptions | null {
        const plugin = BlockOptionsPlugin.instance;
        if (!plugin) return null;
        return plugin.open(block, rect ?? undefined);
    }

    private open(block: HTMLElement, rect?: DOMRect): BlockOptions | null {
        BlockOptionsPlugin.currentMenu?.remove();
        this.closeOverlay();

        const items = this.collectItems(block);
        if (!items.length) return null;

        const menuEl = appendElementOnOverlayArea(
            <BlockOptions>
                {items.map((item) => this.renderMenuItem(item, block, () => menuEl))}
            </BlockOptions>
        ) as BlockOptions;

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

    private renderMenuItem(item: BlockOptionsMenuItem, block: HTMLElement, getMenuEl: () => BlockOptions | null): Element {
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
                onSelect={(event: Event) => {
                    const menu = getMenuEl();
                    if (!menu) return;
                    const trigger = this.resolveTrigger(event);
                    if (!trigger) return;

                    const ctx: BlockOptionsItemContext = {
                        block,
                        blockOptions: menu,
                        menuComponent: menu,
                        trigger,
                        close: () => {
                            const current = getMenuEl();
                            if (!current) return;
                            if (current.isConnected) current.remove();
                            if (BlockOptionsPlugin.currentMenu === current) {
                                BlockOptionsPlugin.currentMenu = null;
                                this.closeOverlay();
                            }
                        },
                        closeOverlay: () => this.closeOverlay(),
                    };

                    if (item.onSelect) {
                        item.onSelect(ctx);
                    }

                    if (item.overlay) {
                        const overlayEl = item.overlay(ctx);
                        if (overlayEl instanceof HTMLElement) {
                            this.openOverlay(overlayEl, menu);
                        }
                    } else {
                        this.closeOverlay();
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

    private openOverlay(overlay: HTMLElement, parentMenu: BlockOptions | null): void {
        this.closeOverlay();

        const appended = overlay.isConnected
            ? overlay
            : appendElementOnOverlayArea(overlay) as HTMLElement;

        BlockOptionsPlugin.currentOverlay = appended;
        this.overlayParentMenu = parentMenu;

        this.overlayRemovalObserver?.disconnect();
        this.overlayRemovalObserver = null;

        if (this.overlayParentMenu) {
            this.overlayParentMenu.disableKeyboardNavigation();
        }

        if (appended instanceof BlockOptions) {
            appended.enableKeyboardNavigation({ focusFirst: true });
        }

        const parent = appended.parentElement;
        if (parent) {
            const observer = new MutationObserver(() => {
                if (!parent.contains(appended)) {
                    observer.disconnect();
                    this.overlayRemovalObserver = null;
                    if (BlockOptionsPlugin.currentOverlay === appended) {
                        BlockOptionsPlugin.currentOverlay = null;
                    }
                    this.restoreParentKeyboardNavigation();
                }
            });
            observer.observe(parent, { childList: true });
            this.overlayRemovalObserver = observer;
        }
    }

    private closeOverlay(): void {
        const overlay = BlockOptionsPlugin.currentOverlay;
        if (!overlay) return;
        this.overlayRemovalObserver?.disconnect();
        this.overlayRemovalObserver = null;
        BlockOptionsPlugin.currentOverlay = null;
        if (overlay.isConnected) overlay.remove();
        this.restoreParentKeyboardNavigation();
    }

    private restoreParentKeyboardNavigation(): void {
        const parentMenu = this.overlayParentMenu;
        this.overlayParentMenu = null;
        parentMenu?.enableKeyboardNavigation({ focusFirst: false });
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

