/** @jsx h */

import { ToolbarItemUI } from "../../../design-system/components/toolbar-item-ui.tsx";
import { dom, keyboard } from "../../index.ts";

interface FormattingToolbarItemProps {
    icon?: HTMLElement;
    tooltip?: string;
    onSelect: (event?: Event, button?: HTMLButtonElement | null) => void;
    isActive: () => boolean;
    refreshSelection(): void;
    dataId?: string;
}

export class FormattingToolbarItem extends ToolbarItemUI<FormattingToolbarItemProps> {

    private buttonEl: HTMLButtonElement | null = null;

    override onMount(): void {
        this.registerEvent(this, dom.EventTypes.MouseDown, (e: Event) => this.handleOnSelect(e, this.props.onSelect));
        this.registerEvent(this, dom.EventTypes.KeyDown, (e: Event) => this.handleOnSelect(e, this.props.onSelect), true);

        this.ensureButtonReference();
        this.handleSelectionChange();
    }

    handleOnSelect(event: Event, onSelect: (event?: Event, button?: HTMLButtonElement | null) => void) {

        if (event instanceof KeyboardEvent) {
            if (event.key !== keyboard.KeyboardKeys.Enter) return;
        }

        event.preventDefault();
        const button = this.ensureButtonReference();
        onSelect?.(event, button);
        this.handleSelectionChange();
        this.props.refreshSelection();

    }

    handleSelectionChange() {
        requestAnimationFrame(() => {
            this.ensureButtonReference();
            if (this.props.isActive()) {
                this.classList.add("active");
            } else {
                this.classList.remove("active");
            }
        });
    }

    private ensureButtonReference(): HTMLButtonElement | null {
        if (!this.buttonEl || !this.buttonEl.isConnected) {
            this.buttonEl = this.querySelector<HTMLButtonElement>("button");
        }

        if (this.buttonEl) {
            if (this.props.dataId) {
                this.buttonEl.dataset.toolbarItem = this.props.dataId;
            } else {
                delete this.buttonEl.dataset.toolbarItem;
            }
        }

        return this.buttonEl;
    }
}