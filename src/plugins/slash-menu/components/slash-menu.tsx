/** @jsx h */
import { Fragment, h } from "../../../jsx.ts";
import { SlashMenuItem } from "./slash-menu-item.tsx";
import { SlashMenuPluginExtension } from "../slash-menu-plugin.tsx";
import { OverlayComponent } from "../../../components/overlay-component.ts";
import { DomUtils } from "../../../utils/dom-utils.ts";
import { SelectionUtils } from "../../../utils/selection-utils.ts";
import { KeyboardKeys } from "../../../constants/keyboard-keys.ts";
import { EventTypes } from "../../../constants/event-types.ts";
import { DataSkip } from "../../../constants/data-skip.ts";
import { ClassName } from "../../../constants/class-name.ts";

import styles from "./slash-menu.css?inline";

interface SlashMenuProps {
    extensionPlugins: SlashMenuPluginExtension[];
}

interface SlashMenuState {
    items: SlashMenuItemData[];
    selectedIndex: number;
    filter: string;
    keyboardNavigating?: boolean;
}

export interface SlashMenuItemData {
    sort: number;
    label: string;
    onSelect: () => void;
    synonyms?: string[];
}

export class SlashMenuOverlay extends OverlayComponent<SlashMenuProps, SlashMenuState> {

    private block: HTMLElement | null;
    private range: Range | null;
    private keyboardNavTimeout: number | undefined;

    static override get tagName() {
        return "slash-menu";
    }

    static override styles = styles;

    constructor() {
        super();

        this.block = DomUtils.findClosestAncestorOfSelectionByClass(ClassName.Block);
        this.range = SelectionUtils.getCurrentSelectionRange();
        this.keyboardNavTimeout = undefined;

        this.state = {
            items: this.getBaseItems(this.block),
            selectedIndex: 0,
            filter: ""
        };
    }

    override onMount(): void {
        const newItems = [...this.state.items];

        for (const plugin of this.props.extensionPlugins) {
            newItems.push({
                sort: plugin.sort || 99,
                label: plugin.label,
                onSelect: () => plugin.onSelect(),
                synonyms: plugin.synonyms || [],
            });
            plugin.onMounted();
        }

        this.registerEvent(document, EventTypes.KeyDown, this.handleKey as EventListener);
        this.setState({ items: newItems });
        this.positionMenu(this);

        this.updateFilterFromEditor();
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
                break;

            case KeyboardKeys.ArrowUp:
                event.preventDefault();
                this.setKeyboardNavigation();
                this.setState({
                    selectedIndex: (this.state.selectedIndex - 1 + this.getFilteredItems().length) % this.getFilteredItems().length,
                });
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

        item.onSelect();
        this.remove(); // By default, remove the SlashMenu after executing onSelect
    }

    setSelectedIndex(index: number) {
        if (!this.state.keyboardNavigating && this.state.selectedIndex !== index) {
            this.setState({ selectedIndex: index });
        }
    }

    render() {
        console.log("slash-menu renderizado");
        const filteredItems = this.getFilteredItems();

        return (
            <Fragment>
                <ul role="menu" part="menu" class="slash-menu shadow-short">
                    {filteredItems.map((item, index) => (
                        <li role="menuitem" part="item">
                            <SlashMenuItem
                                label={item.label}
                                onSelect={() => this.handleOnSelect(item)}
                                selected={index === this.state.selectedIndex}
                                index={index}
                                onMouseOver={() => this.setSelectedIndex(index)}
                            />
                        </li>
                    ))}
                </ul>
            </Fragment>
        );
    }

    private setKeyboardNavigation() {
        this.setState({ keyboardNavigating: true });

        clearTimeout(this.keyboardNavTimeout);
        this.keyboardNavTimeout = window.setTimeout(() => {
            this.setState({ keyboardNavigating: false });
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

        if (!rect && this.block) {
            rect = this.block.getBoundingClientRect();
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

    private getBaseItems(block: HTMLElement | null): SlashMenuItemData[] {
        return [
            {
                sort: 1,
                label: "Paragraph",
                synonyms: ["paragraph", "text"],
                onSelect: () => {
                    const element = DomUtils.insertElementAfter(block, <p class={`${ClassName.Block} ${ClassName.Placeholder}`} data-placeholder='Start typing'><br /></p>);
                    DomUtils.focusOnElement(element);
                }
            },
            {
                sort: 2,
                label: "Heading 1",
                synonyms: ["title", "h1"],
                onSelect: () => {
                    const element = DomUtils.insertElementAfter(block, <h1 class={`${ClassName.Block} ${ClassName.Placeholder}`} data-skip={DataSkip.BlockInsertionNormalizer} data-placeholder='Heading 1'><br /></h1>);
                    DomUtils.focusOnElement(element);
                }
            },
            {
                sort: 3,
                label: "Heading 2",
                synonyms: ["title", "h2"],
                onSelect: () => {
                    const element = DomUtils.insertElementAfter(block, <h2 class={`${ClassName.Block} ${ClassName.Placeholder}`} data-skip={DataSkip.BlockInsertionNormalizer} data-placeholder='Heading 2'><br /></h2>);
                    DomUtils.focusOnElement(element);
                }
            },
            {
                sort: 4,
                label: "Heading 3",
                synonyms: ["title", "h3"],
                onSelect: () => {
                    const element = DomUtils.insertElementAfter(block, <h3 class={`${ClassName.Block} ${ClassName.Placeholder}`} data-placeholder='Heading 3'><br /></h3>);
                    DomUtils.focusOnElement(element);
                }
            },
            {
                sort: 5,
                label: "Heading 4",
                synonyms: ["title", "h4"],
                onSelect: () => {
                    const element = DomUtils.insertElementAfter(block, <h4 class={`${ClassName.Block} ${ClassName.Placeholder}`} data-placeholder='Heading 4'><br /></h4>);
                    DomUtils.focusOnElement(element);
                }
            },
            {
                sort: 6,
                label: "Heading 5",
                synonyms: ["title", "h5"],
                onSelect: () => {
                    const element = DomUtils.insertElementAfter(block, <h5 class={`${ClassName.Block} ${ClassName.Placeholder}`} data-placeholder='Heading 5'><br /></h5>);
                    DomUtils.focusOnElement(element);
                }
            },
            {
                sort: 7,
                label: "Quote",
                synonyms: ["quotation", "cite"],
                onSelect: () => {
                    const element = DomUtils.insertElementAfter(block,
                        <blockquote class={`${ClassName.Block} ${ClassName.Placeholder}`} data-skip={DataSkip.BlockInsertionNormalizer} data-placeholder="To be or not to be">
                            <br />
                        </blockquote>)
                    DomUtils.focusOnElement(element);
                }
            },
            {
                sort: 7,
                label: "List",
                synonyms: ["list", "cite"],
                onSelect: () => {
                    const element = DomUtils.insertElementAfter(block,
                        <ul class={ClassName.Block} data-skip={DataSkip.BlockInsertionNormalizer}>
                            <li class={ClassName.Placeholder} data-placeholder="Item"><br /></li>
                        </ul>)
                    const item = element.querySelector("li");
                    DomUtils.focusOnElement(item);
                }
            },
            {
                sort: 7,
                label: "Ordered List",
                synonyms: ["list", "cite"],
                onSelect: () => {
                    const element = DomUtils.insertElementAfter(block,
                        <ol class={ClassName.Block} data-skip={DataSkip.BlockInsertionNormalizer}>
                            <li class={ClassName.Placeholder} data-placeholder="Item"><br /></li>
                        </ol>)
                    const item = element.querySelector("li");
                    DomUtils.focusOnElement(item);
                }
            },
            {
                sort: 7,
                label: "Todo List",
                synonyms: ["list", "checkbox"],
                onSelect: () => {
                    const element = DomUtils.insertElementAfter(block,
                        <ul class={ClassName.Block} data-skip={DataSkip.BlockInsertionNormalizer}>
                            <li>
                                <input id="abc" type="checkbox" />
                                <span class={ClassName.Placeholder} data-placeholder="Item"><br /></span>
                            </li>
                        </ul>)
                    const item = element.querySelector("span");
                    DomUtils.focusOnElement(item);
                }
            }

        ];
    }
}
