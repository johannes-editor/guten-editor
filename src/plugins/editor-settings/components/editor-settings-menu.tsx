import { DefaultProps } from "@core/components";
import { cleanupCaretAnchor } from "@utils/selection";
import { NavigationMenu } from "@components/ui/composites/navigation-menu";
import { MenuItemUI } from "@components/ui/composites/menu";
import type { EditorSettingsItemData } from "../types.ts";

interface EditorSettingsMenuItemProps extends DefaultProps {
    item: EditorSettingsItemData;
    onSelectItem: (item: EditorSettingsItemData, anchor: HTMLElement) => void;
}

class EditorSettingsMenuItem extends MenuItemUI<EditorSettingsMenuItemProps> {
    override connectedCallback(): void {
        this.icon = this.props.item.icon;
        this.label = this.props.item.label;
        this.rightIndicator = this.props.item.rightIndicator ?? "auto";
        super.connectedCallback();
    }

    override onSelect(event: Event): void {
        const button = (event.target as HTMLElement | null)?.closest?.("button") as HTMLElement | null;
        if (!button) return;
        this.props.onSelectItem(this.props.item, button);
    }
}

export interface EditorSettingsMenuProps extends DefaultProps {
    anchor: HTMLElement;
    items: EditorSettingsItemData[];
}

export class EditorSettingsMenu extends NavigationMenu<EditorSettingsMenuProps> {
    protected override positionMode: "none" | "relative" | "anchor" = "anchor";

    private restoreSelectionToAnchor() {
        const anchor = this.props.anchor;
        if (!anchor || !anchor.isConnected) return;

        const block = anchor.closest(".block") as HTMLElement | null;
        block?.focus();

        const range = document.createRange();
        range.setStartAfter(anchor);
        range.collapse(true);

        const selection = globalThis.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
    }

    override onUnmount(): void {
        super.onUnmount();
        cleanupCaretAnchor(this.props.anchor ?? null);
    }

    private handleSelectItem = (item: EditorSettingsItemData, anchor: HTMLElement) => {
        const shouldClose = item.onSelect(anchor, this) === true;
        if (shouldClose) {
            this.remove();
        }
    };

    override render() {
        const items = [...this.props.items].sort((a, b) => a.sort - b.sort);
        return (
            <div class="guten-menu">
                <ul>
                    {/* <li>
                        <div class="guten-menu-label">{t('settings')}</div>
                    </li> */}
                    {items.map((item) => (
                        <li>
                            <EditorSettingsMenuItem item={item} onSelectItem={this.handleSelectItem} />
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
}