/** @jsx h */

import { KeyboardKeys } from "@utils/keyboard";
import { EventTypes } from "@utils/dom";
import { ToolbarItemUI } from "@components/ui/composites/toolbar";
import { ArrowDownIcon } from "@components/ui/icons";

interface FormattingToolbarItemProps {

    label?: string;

    icon?: HTMLElement;
    shortcut?: string;
    tooltip?: string;
    onSelect: (event?: Event, button?: HTMLButtonElement | null) => void;
    isActive: () => boolean;
    refreshSelection(): void;

    showMenuIndicator?: boolean;
}

export class FormattingToolbarItem extends ToolbarItemUI<FormattingToolbarItemProps> {


    static override styles = this.extendStyles(/*css*/`

        .guten-toolbar-item button {
            display: inline-flex;
            align-items: center;
            gap: 0.1252rem;
        }

        .guten-toolbar-item__menu-indicator {
            display: inline-flex;
            align-items: center;
            // color: var(--color-ui-text);
            // opacity: 0.55;
            pointer-events: none;
        }

        .guten-toolbar-item__menu-indicator svg {
            width: 8px !important;
            height: 8px !important;
        }
    `);


    private buttonEl: HTMLButtonElement | null = null;
    private menuIndicatorEl: HTMLElement | null = null;

    override onMount(): void {
        this.registerEvent(this, EventTypes.MouseDown, (e: Event) => this.handleOnSelect(e, this.props.onSelect));
        this.registerEvent(this, EventTypes.KeyDown, (e: Event) => this.handleOnSelect(e, this.props.onSelect), true);

        this.ensureButtonReference();
        this.handleSelectionChange();
    }

    override afterRender(): void {
        this.buttonEl = null;
        this.ensureButtonReference();
    }

    handleOnSelect(event: Event, onSelect: (event?: Event, button?: HTMLButtonElement | null) => void) {

        if (event instanceof KeyboardEvent) {
            if (event.key !== KeyboardKeys.Enter) return;
        }

        event.preventDefault();
        const button = this.ensureButtonReference();
        onSelect?.(event, button);
        this.handleSelectionChange();
        this.props.refreshSelection();

    }

    handleSelectionChange() {
        requestAnimationFrame(() => {
            if (this.props.isActive()) {
                this.classList.add("active");
            } else {
                this.classList.remove("active");
            }
        });
    }

    public refreshActiveState(): void {
        this.handleSelectionChange();
    }

    private ensureButtonReference(): HTMLButtonElement | null {
        if (!this.buttonEl || !this.buttonEl.isConnected) {
            this.buttonEl = this.querySelector<HTMLButtonElement>("button");
        }

        this.attachMenuIndicator();

        return this.buttonEl;
    }

    private attachMenuIndicator(): void {
        const button = this.buttonEl;
        if (!button) return;

        if (!this.props.showMenuIndicator) {
            if (this.menuIndicatorEl) {
                this.menuIndicatorEl.remove();
                this.menuIndicatorEl = null;
            }
            return;
        }

        if (!this.menuIndicatorEl || !this.menuIndicatorEl.isConnected) {
            const indicator = document.createElement("span");
            indicator.classList.add("guten-toolbar-item__menu-indicator");
            indicator.setAttribute("aria-hidden", "true");
            indicator.appendChild(ArrowDownIcon());
            this.menuIndicatorEl = indicator;
        }

        if (this.menuIndicatorEl.parentElement !== button) {
            this.menuIndicatorEl.remove();
            button.appendChild(this.menuIndicatorEl);
        }
    }
}