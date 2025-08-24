/** @jsx h */
/** @jsxFrag Fragment */

import { h } from "../../index.ts";
import { OverlayComponent } from "../../../components/overlay/overlay-component.ts";
import { dom, keyboard } from "../../index.ts";

interface EmojiPickerOverlayProps {
    range: Range;
}

interface EmojiPickerOverlayState {
    emojis: string[];
    selectedIndex: number;
}

export class EmojiPickerOverlay extends OverlayComponent<EmojiPickerOverlayProps, EmojiPickerOverlayState> {
    range: Range | null;

    static override get tagName() {
        return "emoji-picker-overlay";
    }

    override zIndex: number = 1100;

    constructor() {
        super();
        this.state = {
            emojis: [
                "😀", "😅", "😂", "😍", "🤔",
                "🥳", "😭", "😡", "👍", "👎",
                "🔥", "❤️", "🎉", "😎", "🚀"
            ],
            selectedIndex: 0,
        };

        const selection = window.getSelection();
        this.range = selection && selection.rangeCount > 0
            ? selection.getRangeAt(0).cloneRange()
            : null;
    }

    override onMount(): void {
        this.registerEvent(document, dom.EventTypes.KeyDown, this.handleKey as EventListener);
    }

    private readonly handleKey = (event: KeyboardEvent) => {
        switch (event.key) {
            case keyboard.KeyboardKeys.ArrowDown:
                event.preventDefault();
                this.setState({
                    selectedIndex: (this.state.selectedIndex + 1) % this.state.emojis.length,
                });
                break;
            case keyboard.KeyboardKeys.ArrowUp:
                event.preventDefault();
                this.setState({
                    selectedIndex: (this.state.selectedIndex - 1 + this.state.emojis.length) % this.state.emojis.length,
                });
                break;
            case keyboard.KeyboardKeys.Enter:
                event.preventDefault();
                const emoji = this.state.emojis[this.state.selectedIndex];
                this.selectEmoji(emoji);
                break;
            case keyboard.KeyboardKeys.Escape:
                break;
        }
    };

    selectEmoji(emoji: string) {

        insertIntoBlockAtCaret(emoji, this.range);

        this.remove();
    }

    render() {
        return (
            <ul part="emoji-menu" class="emoji-picker">
                {this.state.emojis.map((emoji, index) => (
                    <li part="emoji-item">
                        <button type="button"
                            class={index === this.state.selectedIndex ? "selected" : ""}
                            onClick={() => this.selectEmoji(emoji)}
                            tabindex={-1}
                            style={{
                                fontSize: "1.5rem",
                                padding: "4px 8px",
                                background: index === this.state.selectedIndex ? "#eee" : "transparent",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            {emoji}
                        </button>
                    </li>
                ))}
            </ul>
        );
    }
}


function insertIntoBlockAtCaret(content: string, range: Range | null) {
    if (!range) return;

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    range.insertNode(document.createRange().createContextualFragment(content));

    
    if (selection) {
        selection.collapseToEnd();
    }
}