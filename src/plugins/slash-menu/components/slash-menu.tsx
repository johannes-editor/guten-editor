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
        return "slash-menu";
    }

    static override styles = this.extendStyles(/*css */`
        
        slash-menu .slash-menu-wrapper {
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
        this.setState({ filter, selectedIndex: 0 });
    }

    getCurrentSlashCommandFilter(): string {
        const selection = globalThis.getSelection();
        if (!selection || !selection.anchorNode) return "";
        const node = selection.anchorNode;
        let text = node.textContent || "";
        let caretPos = selection.anchorOffset;

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

    private getAnchorRect(): DOMRect | null {
        const a = this.props.anchorNode;
        if (!a || !a.parentNode) return null;

        const r = document.createRange();

        if (a instanceof Text) {
            r.setStart(a, 0);
            r.setEnd(a, Math.min(1, a.length));
        } else {
            r.selectNode(a);
        }

        const rects = r.getClientRects();
        if (rects.length > 0) return rects[0];
        return r.getBoundingClientRect();
    }

    private positionMenu(element: HTMLElement) {

        const rect =
            this.getAnchorRect();

        if (!rect) return;

        const gap = 2;

        const parent = (this as unknown as HTMLElement).offsetParent as HTMLElement | null;
        const pad = parent
            ? (() => {
                const pr = parent.getBoundingClientRect();
                const left = pr.left + parent.clientLeft;
                const top = pr.top + parent.clientTop;
                const right = left + parent.clientWidth;
                const bottom = top + parent.clientHeight;
                return { left, top, right, bottom };
            })()
            : { left: 0, top: 0, right: globalThis.innerWidth, bottom: globalThis.innerHeight };

        this.style.position = 'absolute';

        const { width: menuWidth, height: menuHeight } = element.getBoundingClientRect();

        const spaceBelow = globalThis.innerHeight - rect.bottom;
        const showAbove = spaceBelow < menuHeight && rect.top > menuHeight;

        if (showAbove) {
            this.style.bottom = `${pad.bottom - (rect.top - gap)}px`;
            this.style.top = '';
        } else {
            this.style.top = `${(rect.bottom + gap) - pad.top}px`;
            this.style.bottom = '';
        }


        const spaceRight = globalThis.innerWidth - rect.right;
        const spaceLeft = rect.left;
        const showRight = spaceRight >= menuWidth || spaceRight >= spaceLeft;

        if (showRight) {

            this.style.left = `${(rect.right + gap) - pad.left}px`;
            this.style.right = '';
        } else {
            this.style.right = `${pad.right - (rect.left - gap)}px`;
            this.style.left = '';
        }
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
