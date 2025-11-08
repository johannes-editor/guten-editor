/** @jsx h */
import { dom, keyboard, h, t, OverlayComponent } from "../../index.ts";
import { SlashMenuItem } from "./slash-menu-item.tsx";
import { findClosestAncestorOfSelectionByClass } from "../../../utils/dom-utils.ts";

import { SelectionUtils } from "../../../utils/selection/selection-utils.ts";

import { SlashMenuItemData } from "./types.ts";

interface SlashMenuProps {
    items: SlashMenuItemData[];
    anchorNode: Node;
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
        return "guten-slash-menu";
    }

    static override styles = this.extendStyles(/*css */`
        
        guten-slash-menu .slash-menu-wrapper {
            border-radius: 10px;
            overflow: hidden;
            max-height: 18rem;
        }

        .guten-menu{
            opacity: 0;
        }

        .guten-menu ul{
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            padding: 0;
            margin: 0;
            overflow-y: auto;
            max-height: 12rem;
            padding: 0 .5rem;

            width: max-content;
        }

        .guten-menu li{
            list-style: none;
        }

        .guten-menu .slash-menu li:first-child {
            margin-top: 0.5rem;
        }

        .guten-menu .slash-menu li:last-child {
            margin-bottom: 0.5rem;
        }

        .guten-menu button {
            all: unset;
            display: flex;
            padding: .25rem 1rem;
            border-radius: 5px;
            width: 100%;
            box-sizing: border-box;
        }

        .guten-menu button.selected {
            background-color: #f5f5f5;
        }

        .guten-menu.no-items-found {
            padding: 8px;
        }

    ` );

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

    override connectedCallback(): void {
        this.classList.add("guten-menu", "card", "animate-overlay");
        super.connectedCallback();
    }

    override onMount(): void {
        this.registerEvent(document, dom.EventTypes.KeyDown, this.handleKey as EventListener);
        this.registerEvent(this, dom.EventTypes.MouseMove, this.handleMouse as EventListener)
        this.setState({ items: this.props.items });
        this.positionToAnchor(this.props.anchorNode);

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
            event.key === keyboard.KeyboardKeys.Backspace ||
            event.key === keyboard.KeyboardKeys.Delete
        ) {
            setTimeout(() => this.updateFilterFromEditor(), 0);
        }

        switch (event.key) {

            case keyboard.KeyboardKeys.ArrowDown:
                event.preventDefault();
                this.setKeyboardNavigation();
                this.setState({
                    selectedIndex: (this.state.selectedIndex + 1) % this.getFilteredItems().length,
                });

                this.ensureItemVisibility();
                break;

            case keyboard.KeyboardKeys.ArrowUp:
                event.preventDefault();
                this.setKeyboardNavigation();
                this.setState({
                    selectedIndex: (this.state.selectedIndex - 1 + this.getFilteredItems().length) % this.getFilteredItems().length,
                });

                this.ensureItemVisibility();
                break;

            case keyboard.KeyboardKeys.Enter:
                event.preventDefault();
                {
                    const items = this.getFilteredItems();
                    const item = items[this.state.selectedIndex];
                    if (item) {
                        this.handleOnSelect(item);
                    }
                }
                break;

            case keyboard.KeyboardKeys.Backspace:
                {
                    const items = this.getFilteredItems();
                    items[this.state.selectedIndex];
                }
                break;

            case keyboard.KeyboardKeys.Escape:
                // No need to handle the Escape key here.
                // All elements inheriting from Overlay already handle Escape key presses.
                // The OverlayManager takes care of stacked overlays: pressing Escape will always close the topmost overlay first (LIFO order).
                break;
        }
    };

    private removeSlashCommand() {
        if (!this.range) return;

        const current = SelectionUtils.getCurrentSelectionRange();
        const selection = globalThis.getSelection();
        if (!current || !selection) return;

        const removeRange = this.range.cloneRange();
        try {
            removeRange.setStart(removeRange.startContainer, Math.max(0, removeRange.startOffset - 1));
        } catch {
            return;
        }
        removeRange.setEnd(current.endContainer, current.endOffset);
        removeRange.deleteContents();
        removeRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(removeRange);
    }

    updateFilterFromEditor() {
        const filter = this.getCurrentSlashCommandFilter();
        if (filter === null) {
            this.remove();
            return;
        }
        this.setState({ filter, selectedIndex: 0 });
    }

    getCurrentSlashCommandFilter(): string | null {
        const selection = globalThis.getSelection();
        if (!selection || selection.rangeCount === 0) return null;

        const range = selection.getRangeAt(0).cloneRange();
        try {
            range.setStart(range.startContainer, 0);
        } catch {
            return null;
        }
        const text = range.toString();

        const slashIndex = text.lastIndexOf("/");
        if (slashIndex === -1) return null;

        return text.slice(slashIndex + 1).trim();
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
        this.removeSlashCommand();

        const block = this.focusedBlock!;
        item.onSelect(block);

        const shouldRemoveBlock =
            !block.textContent?.trim() &&
            (block.childElementCount === 0 ||
                (block.childElementCount === 1 && block.firstElementChild?.tagName === "BR"));

        if (shouldRemoveBlock) {
            block.remove();
        }

        this.remove();
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
                                icon={item.icon}
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
        this.keyboardNavTimeout = globalThis.setTimeout(() => {
            this.keyboardNavigating = false;
        }, 500);
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
