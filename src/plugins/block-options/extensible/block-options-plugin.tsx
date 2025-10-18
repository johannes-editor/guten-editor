/** @jsx h */
import { h, ExtensiblePlugin, appendElementOnOverlayArea, runCommand, t, icons } from "../../index.ts";
import { BlockOptionsMenu } from "../components/block-options-menu.tsx";
import { PluginExtension } from "../../../core/plugin-engine/plugin-extension.ts";
import { BlockOptionsMenuItem } from "../components/block-options-menu-item.tsx";

export interface BlockOptionsItemContext {
    block: HTMLElement;
    blockOptions: HTMLElement;
    menuComponent: BlockOptionsMenu | null;
    trigger: HTMLElement;
}

export type BlockOptionsMenuItemType = "item" | "label" | "separator";

export interface BlockOptionsItem {
    id: string;
    type?: BlockOptionsMenuItemType;
    icon?: Element;
    label?: string | ((block: HTMLElement) => string);
    sort?: number;
    isActive?: (block: HTMLElement) => boolean;
    isVisible?: (block: HTMLElement) => boolean;
    onSelect?: (context: BlockOptionsItemContext) => void;
    overlay?: (context: BlockOptionsItemContext) => Element | null;
    rightIndicator?: "auto" | "check" | "chevron" | "none";
}

export class BlockOptionsPlugin extends ExtensiblePlugin<BlockOptionsExtensionPlugin> {

    private static instance: BlockOptionsPlugin | null = null;
    private static currentMenu: BlockOptionsMenu | null = null;

    private extensions: BlockOptionsExtensionPlugin[] = [];

    override setup(_root: HTMLElement): void {
        BlockOptionsPlugin.instance = this;
    }

    override attachExtensions(extensions: BlockOptionsExtensionPlugin[]): void {
        this.extensions = extensions ?? [];
    }

    static openForBlock(block: HTMLElement, rect?: DOMRect | null): BlockOptionsMenu | null {
        const plugin = BlockOptionsPlugin.instance;
        if (!plugin) return null;
        return plugin.open(block, rect ?? undefined);
    }

    private open(block: HTMLElement, rect?: DOMRect): BlockOptionsMenu | null {

        const items = this.collectItems(block);
        if (!items.length) return null;

        const menuEl = appendElementOnOverlayArea(
            <BlockOptionsMenu>
                {items.map((item) => this.renderMenuItem(item, block, () => menuEl))}
            </BlockOptionsMenu>
        ) as BlockOptionsMenu;

        BlockOptionsPlugin.currentMenu = menuEl;


        menuEl.positionToAnchor(rect || new DOMRect());

        return menuEl;
    }

    private collectItems(block: HTMLElement): BlockOptionsItem[] {
        const isVisible = (item: BlockOptionsItem) =>
            item.isVisible ? item.isVisible(block) : true;

        const bySort = (a: BlockOptionsItem, b: BlockOptionsItem) =>
            (a.sort ?? 0) - (b.sort ?? 0);

        const baseItems = this
            .defaultItems()
            .filter(isVisible)
            .sort(bySort);

        const extensionItems = this.extensions
            .flatMap((ext) => ext.items(block))
            .filter(isVisible)
            .sort(bySort);

        if (extensionItems.length === 0) {
            return baseItems;
        }

        const separator: BlockOptionsItem = {
            id: "extensionsSeparator",
            type: "separator",
        };

        return [...extensionItems, separator, ...baseItems ];
    }


    private renderMenuItem(item: BlockOptionsItem, block: HTMLElement, getMenuEl: () => BlockOptionsMenu | null): Element {
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
            <BlockOptionsMenuItem
                block={block}
                getMenuEl={getMenuEl}
                icon={item.icon}
                label={labelValue}
                isActive={item.isActive?.(block)}
                data-block-options-id={item.id}
                rightIndicator={item.rightIndicator || "none"}
                onSelect={item.onSelect}
            />
        );
    }

    private defaultItems(): BlockOptionsItem[] {
        return [
            // {
            //     id: "duplicateBlock",
            //     icon: <icons.CopyIcon />,
            //     label: t("duplicate"),
            //     sort: 10,
            //     onSelect: ({ block, blockOptions }) => {
            //         runCommand("duplicateBlock", { content: { block, blockOptions } });
            //     },
            // },
            {
                id: "moveBlockUp",
                icon: <icons.ArrowUpIcon />,
                label: t("move_up"),
                sort: 20,
                onSelect: ({ block, blockOptions }) => {
                    runCommand("moveBlockUp", { content: { block, blockOptions } });
                },
            },
            {
                id: "deleteBlock",
                icon: <icons.TrashIcon />,
                label: t("delete"),
                sort: 30,
                onSelect: ({ block, blockOptions }) => {
                    runCommand("deleteBlock", { content: { block, blockOptions } });
                },
            },
            {
                id: "moveBlockDown",
                icon: <icons.ArrowDownIcon />,
                label: t("move_down"),
                sort: 40,
                onSelect: ({ block, blockOptions }) => {
                    runCommand("moveBlockDown", { content: { block, blockOptions } });
                },
            }
            
        ];
    }
}

export abstract class BlockOptionsExtensionPlugin extends PluginExtension<BlockOptionsPlugin> {
    override readonly target = BlockOptionsPlugin;

    abstract items(block: HTMLElement): BlockOptionsItem[];
}