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
            this.positionMenu(menuEl, rect);
        }

        return menuEl;
    }

    private positionMenu(menu: BlockOptions, anchorRect: DOMRect): void {
        const gap = 8;

        const bounds = this.getOverlayBounds(menu);

        menu.style.maxHeight = "";
        menu.style.maxWidth = "";
        menu.style.overflowY = "";
        menu.style.right = "";
        menu.style.bottom = "";
        menu.style.top = "0px";
        menu.style.left = "0px";

        const menuRect = menu.getBoundingClientRect();
        let menuWidth = menuRect.width;
        let menuHeight = menuRect.height;

        const availableWidth = bounds.width;
        if (menuWidth > availableWidth) {
            menuWidth = availableWidth;
            menu.style.maxWidth = `${availableWidth}px`;
        }

        const availableHeight = bounds.height;
        if (menuHeight > availableHeight) {
            menuHeight = availableHeight;
            menu.style.maxHeight = `${availableHeight}px`;
            menu.style.overflowY = "auto";
        }

        let top = anchorRect.top;
        let left = anchorRect.right + gap;

        const maxLeft = bounds.right - menuWidth;
        if (left > maxLeft) {
            const alternativeLeft = anchorRect.left - gap - menuWidth;
            if (alternativeLeft >= bounds.left) {
                left = alternativeLeft;
            } else {
                left = Math.max(maxLeft, bounds.left);
            }
        }

        if (left < bounds.left) {
            left = bounds.left;
        }

        const maxTop = bounds.bottom - menuHeight;
        if (top > maxTop) {
            top = Math.max(maxTop, bounds.top);
        }

        if (top < bounds.top) {
            top = bounds.top;
        }

        menu.style.top = `${top - bounds.top}px`;
        menu.style.left = `${left - bounds.left}px`;
    }

    private getOverlayBounds(element: HTMLElement): {
        left: number;
        top: number;
        right: number;
        bottom: number;
        width: number;
        height: number;
    } {
        const parent = element.offsetParent as HTMLElement | null;
        if (parent) {
            const rect = parent.getBoundingClientRect();
            const width = parent.clientWidth;
            const height = parent.clientHeight;

            if (width > 0 && height > 0) {
                const left = rect.left + parent.clientLeft;
                const top = rect.top + parent.clientTop;
                return {
                    left,
                    top,
                    right: left + width,
                    bottom: top + height,
                    width,
                    height,
                };
            }
        }

        const viewportWidth = globalThis.innerWidth;
        const viewportHeight = globalThis.innerHeight;

        return {
            left: 0,
            top: 0,
            right: viewportWidth,
            bottom: viewportHeight,
            width: viewportWidth,
            height: viewportHeight,
        };
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
                hasOverlay={Boolean(item.overlay)}
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

