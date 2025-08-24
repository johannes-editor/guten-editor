/** @jsx h */

import { ToolbarItemUI } from "../../../design-system/components/toolbar-item-ui.tsx";
import { dom, keyboard } from "../../index.ts";

interface FormattingToolbarItemProps {
    icon?: HTMLElement;
    tooltip?: string;
    onSelect: () => void;
    isActive: () => boolean;
    refreshRange(): void;
}

export class FormattingToolbarItem extends ToolbarItemUI<FormattingToolbarItemProps> {

    override onMount(): void {
        this.registerEvent(this, dom.EventTypes.MouseDown, (e: Event) => this.handleOnSelect(e, this.props.onSelect));
        this.registerEvent(this, dom.EventTypes.KeyDown, (e: Event) => this.handleOnSelect(e, this.props.onSelect), true);

        this.handleSelectionChange();
    }

    handleOnSelect(event: Event, onSelect: () => void) {
        
        if (event instanceof KeyboardEvent) {
            if (event.key !== keyboard.KeyboardKeys.Enter) return;
        }

        event.preventDefault();
        onSelect();
        this.handleSelectionChange();
        this.props.refreshRange();

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
}