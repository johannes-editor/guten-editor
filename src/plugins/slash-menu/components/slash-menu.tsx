import { t } from "@core/i18n";
import { EventTypes } from "@utils/dom";
import { KeyboardKeys } from "@utils/keyboard";
import { isMobileSheetViewport } from "@utils/platform";
import { OverlayComponent } from "@components/editor/overlay";
import { findClosestAncestorOfSelectionByClass } from "@utils/dom";
import { getCurrentSelectionRange } from "@utils/selection";
import { SlashMenuItem } from "./slash-menu-item.tsx";
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

        @media (max-width: 720px) {
            .guten-modal--sheet-mobile ul{
                min-height: 20rem;
            }
        }
        
        guten-slash-menu .slash-menu-wrapper {
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
            
            @-moz-document url-prefix() {
                .slash-menu-wrapper {
                    padding-right: 12px !important;
                }
            }
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
            padding: .25rem 10px;
            border-radius: var(--menu-item-radius);
            width: 100%;
            box-sizing: border-box;
            color: var(--menu-item-color);
            background: var(--menu-item-bg);
            border: var(--menu-item-border);
            box-shadow: var(--menu-item-shadow, none);
        }

        .guten-menu button:hover,
        .guten-menu button:focus {
            background-color: var(--menu-item-bg-hover);
            border: var(--menu-item-border-hover);
            color: var(--menu-item-color-hover);
        }

        .guten-menu button.selected {
            background-color: var(--menu-item-bg-selected);
            border: var(--menu-item-border-selected);
            color: var(--menu-item-color-selected);
        }

        .block-controls{
            visibility: hidden ;
            transition: opacity 120ms ease-out, visibility 0s linear;
        }

    ` );

    constructor() {
        super();

        this.focusedBlock = findClosestAncestorOfSelectionByClass("block");
        this.range = getCurrentSelectionRange();
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
        this.registerEvent(document, EventTypes.KeyDown, this.handleKey as EventListener);
        this.registerEvent(this, EventTypes.MouseMove, this.handleMouse as EventListener)
        this.registerEvent(document, EventTypes.Input, this.handleInput as EventListener);
        this.registerEvent(document, EventTypes.SelectionChange, this.handleSelectionChange as EventListener);

        this.setState({ items: this.props.items });

        if (!isMobileSheetViewport()) {
            this.positionToAnchor(this.props.anchorNode);
        }

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

    private readonly handleInput = () => {
        this.updateFilterFromEditor();
    };

    private readonly handleSelectionChange = () => {
        this.updateFilterFromEditor();
    };

    private removeSlashCommand() {
        if (!this.range) return;

        const current = getCurrentSelectionRange();
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

        const getMatchScore = (value: string): number | null => {
            const normalized = value.toLowerCase();
            const index = normalized.indexOf(f);
            if (index === -1) return null;
            if (normalized === f) return 0;
            if (index === 0) return 100 + index;
            return 200 + index;
        };

        return sortedItems
            .map(item => {
                const labelScore = getMatchScore(item.label);
                const synonymScores = (item.synonyms ?? [])
                    .map(getMatchScore)
                    .filter((score): score is number => score !== null);
                const bestScore = [labelScore, ...synonymScores]
                    .filter((score): score is number => score !== null)
                    .reduce((min, score) => Math.min(min, score), Number.POSITIVE_INFINITY);

                if (!Number.isFinite(bestScore)) return null;

                return { item, score: bestScore };
            })
            .filter((entry): entry is { item: SlashMenuItemData; score: number } => entry !== null)
            .sort((a, b) => a.score - b.score || a.item.sort - b.item.sort)
            .map(entry => entry.item);
    }

    handleOnSelect(item: SlashMenuItemData) {
        this.removeSlashCommand();

        const block = this.focusedBlock!;
        item.onSelect(block);

        const shouldRemoveBlock =
            !block.textContent?.trim() &&
            (block.childElementCount === 0 ||
                (block.childElementCount === 1 && block.firstElementChild?.tagName === "BR"));

        if (shouldRemoveBlock && !item.preserveEmptyBlock) {
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
                                shortcut={item.shortcut}
                                onSelect={() => this.handleOnSelect(item)}
                                selected={index === this.state.selectedIndex}
                                index={index}
                                onMouseOver={() => this.mouseSetSelectedIndex(index)}
                            />
                        </li>
                    ))}

                    {filtered.length === 0 && (
                        <li role="menuitem">
                            <SlashMenuItem
                                label={t("no_item_found")}
                                shortcut="Esc"
                                onSelect={() => {
                                    this.removeSlashCommand();
                                    this.remove();
                                }}
                                selected={1 === this.state.selectedIndex}
                                index={1}
                                onMouseOver={() => this.mouseSetSelectedIndex(1)}
                            />
                        </li>
                    )}
                </ul>
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
