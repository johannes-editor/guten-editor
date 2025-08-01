/** @jsx h */
import { h, t, EventTypes, KeyboardKeys, OverlayComponent } from "../../index.ts";
import { SlashMenuItem } from "./slash-menu-item.tsx";
import { findClosestAncestorOfSelectionByClass } from "../../../utils/dom-utils.ts";

import { SelectionUtils } from "../../../utils/selection-utils.ts";

import { SlashMenuItemData } from "./types.ts";

import styles from "./slash-menu.css?inline";

interface SlashMenuProps {
    items: SlashMenuItemData[];
}

interface SlashMenuState {
    items: SlashMenuItemData[];
    selectedIndex: number;
    filter: string;
}

export class SlashMenuOverlay extends OverlayComponent<SlashMenuProps, SlashMenuState> {

    private focusedBlock: HTMLElement | null;
    private range: Range | null;
    private keyboardNavTimeout: number | undefined;
    private keyboardNavigating: boolean = false;
    private mouseX: number = 0;
    private mouseY: number = 0;
    private mouseMoved: boolean = false;
    private previousScrollTop: number = 0;

    static override get tagName() {
        return "slash-menu";
    }

    static override styles = styles;

    constructor() {
        super();

        this.focusedBlock = findClosestAncestorOfSelectionByClass("block");
        this.range = SelectionUtils.getCurrentSelectionRange();
        this.keyboardNavTimeout = undefined;

        this.state = {
            items: [],
            selectedIndex: 0,
            filter: ""
        };
    }

    override onMount(): void {
        this.registerEvent(document, EventTypes.KeyDown, this.handleKey as EventListener);
        this.registerEvent(this, EventTypes.MouseMove, this.handleMouse as EventListener)
        this.setState({ items: this.props.items });
        this.positionMenu(this);

        this.updateFilterFromEditor();
    }

    private readonly handleMouse = (event: MouseEvent) => {
        if (this.mouseX != event.clientX || this.mouseY != event.clientY) {
            this.mouseX = event.clientX;
            this.mouseY = event.clientY;

            this.mouseMoved = true;
        }
    }

    private readonly handleKey = (event: KeyboardEvent) => {
        if (
            (event.key.length === 1 && !event.ctrlKey && !event.metaKey) ||
            event.key === KeyboardKeys.Backspace ||
            event.key === KeyboardKeys.Delete
        ) {
            setTimeout(() => this.updateFilterFromEditor(), 0);
        }

        switch (event.key) {

            case KeyboardKeys.ArrowDown:
                event.preventDefault();
                this.setKeyboardNavigation();
                this.setState({
                    selectedIndex: (this.state.selectedIndex + 1) % this.getFilteredItems().length,
                });

                this.ensureItemVisibility();
                break;

            case KeyboardKeys.ArrowUp:
                event.preventDefault();
                this.setKeyboardNavigation();
                this.setState({
                    selectedIndex: (this.state.selectedIndex - 1 + this.getFilteredItems().length) % this.getFilteredItems().length,
                });

                this.ensureItemVisibility();
                break;

            case KeyboardKeys.Enter:
                event.preventDefault();
                {
                    const items = this.getFilteredItems();
                    const item = items[this.state.selectedIndex];
                    if (item) {
                        this.handleOnSelect(item);
                    }
                }
                break;

            case KeyboardKeys.Backspace:
                {
                    const items = this.getFilteredItems();
                    items[this.state.selectedIndex];
                }
                break;

            case KeyboardKeys.Escape:
                // No need to handle the Escape key here.
                // All elements inheriting from Overlay already handle Escape key presses.
                // The OverlayManager takes care of stacked overlays: pressing Escape will always close the topmost overlay first (LIFO order).
                break;
        }
    };

    updateFilterFromEditor() {
        const filter = this.getCurrentSlashCommandFilter();
        this.setState({ filter, selectedIndex: 0 });
    }

    getCurrentSlashCommandFilter(): string {
        const selection = window.getSelection();
        if (!selection || !selection.anchorNode) return "";
        const node = selection.anchorNode;
        let text = node.textContent || "";
        let caretPos = selection.anchorOffset;

        // Edge case
        if (node.nodeType !== Node.TEXT_NODE && node.childNodes.length) {
            Array.from(node.childNodes).forEach(child => {
                if (child.nodeType === Node.TEXT_NODE) {
                    text = child.textContent || "";
                }
            });
            caretPos = text.length;
        }

        const slashIndex = text.lastIndexOf('/', caretPos - 1);
        if (slashIndex === -1) return "";

        return text.slice(slashIndex + 1, caretPos).trim();
    }

    getFilteredItems(): SlashMenuItemData[] {
        const { items, filter } = this.state;
        const sortedItems = [...items].sort((a, b) => a.sort - b.sort);

        if (!filter) return sortedItems;

        const f = filter.toLowerCase();
        return sortedItems.filter(item =>
            item.label.toLowerCase().includes(f) ||
            (item.synonyms && item.synonyms.some(s => s.toLowerCase().includes(f)))
        );
    }

    handleOnSelect(item: SlashMenuItemData) {
        item.onSelect(this.focusedBlock!);
        this.remove(); // By default, remove the SlashMenu after executing onSelect
    }

    setSelectedIndex(index: number) {

        if (!this.keyboardNavigating && this.state.selectedIndex !== index) {
            this.setState({ selectedIndex: index });
        }
    }

    mouseSetSelectedIndex(index: number) {
        if (this.mouseMoved && this.state.selectedIndex !== index) {

            const menu = this.querySelector(".slash-menu");

            if (!menu) return;
            this.previousScrollTop = menu.scrollTop || 0;

            this.setState({ selectedIndex: index });
            this.mouseMoved = false;

            const menu2 = this.querySelector(".slash-menu");
            if (menu2) {

                menu2.scrollTop = this.previousScrollTop;
            }
        }
    }

    render() {

        const filtered = this.getFilteredItems();

        return (
            <div class="slash-menu-wrapper">

                <ul role="menu" class="slash-menu">
                    {filtered.map((item, index) => (
                        <li role="menuitem">
                            <SlashMenuItem
                                label={item.label}
                                onSelect={() => this.handleOnSelect(item)}
                                selected={index === this.state.selectedIndex}
                                index={index}
                                onMouseOver={() => this.mouseSetSelectedIndex(index)}
                            />
                        </li>
                    ))}
                </ul>

                {filtered.length === 0 && (
                    <div class="no-items-found">
                        {t("no_item_found")}
                    </div>
                )}

            </div>
        );
    }

    private setKeyboardNavigation() {
        this.keyboardNavigating = true;

        clearTimeout(this.keyboardNavTimeout);
        this.keyboardNavTimeout = window.setTimeout(() => {
            this.keyboardNavigating = false;
        }, 500);
    }

    private positionMenu(element: HTMLElement) {
        let rect: DOMRect | null = null;

        if (this.range) {
            rect = this.range.getBoundingClientRect();

            if (rect.width === 0 || rect.height === 0) {
                const tempSpan = document.createElement("span");
                tempSpan.textContent = "\u200B";
                this.range.insertNode(tempSpan);
                rect = tempSpan.getBoundingClientRect();
                tempSpan.remove();
            }
        }

        if (!rect && this.focusedBlock) {
            rect = this.focusedBlock.getBoundingClientRect();
        }

        if (!rect) return;

        const menuHeight = element.getBoundingClientRect().height;
        const spaceBelow = window.innerHeight - rect.bottom;
        const showAbove = spaceBelow < menuHeight && rect.top > menuHeight;

        const top = showAbove
            ? rect.top + window.scrollY - menuHeight
            : rect.bottom + window.scrollY;

        this.style.position = 'absolute';
        this.style.left = `${rect.left + window.scrollX}px`;
        this.style.top = `${top}px`;
    }


    private ensureItemVisibility() {

        const menu = this.querySelector(".slash-menu");
        if (!menu) return;


        // const previousScrollTop = menu?.scrollTop || 0;

        const selectedItem = menu.children[this.state.selectedIndex] as HTMLElement;

        if (!selectedItem) return;

        const menuRect = menu.getBoundingClientRect();
        const itemRect = selectedItem.getBoundingClientRect();


        selectedItem.scrollIntoView({
            block: "nearest",
            inline: "nearest",
            behavior: "auto", // ou "instant"
        });

        // // Verifica se o item está visível
        // if (itemRect.top < menuRect.top) {
        //     // Rolagem para cima
        //     menu.scrollTop = selectedItem.offsetTop;
        // } else if (itemRect.bottom > menuRect.bottom) {
        //     // Rolagem para baixo
        //     menu.scrollTop = selectedItem.offsetTop - menuRect.height + selectedItem.clientHeight;
        // }





        // const menu = this.querySelector(".slash-menu");
        // const previousScrollTop = menu?.scrollTop || 0;

        // this.setState({ selectedIndex: index });
        // this.mouseMoved = false;


        this.previousScrollTop = menu?.scrollTop || 0;

        // const menu2 = this.querySelector(".slash-menu");
        // console.log("menu depois: ", menu2);
        // console.log("previous scroll depois: ", this.previousScrollTop);
        // if (menu2) {

        //     menu2.scrollTop = this.previousScrollTop;
        // }



    }

    

}
