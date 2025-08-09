/** @jsx h */

import { ToolbarItem } from "../../../design-system/components/toolbar-item.tsx";
import { EventTypes, KeyboardKeys } from "../../index.ts";

interface FormattingToolbarItemProps {
    icon?: HTMLElement;
    tooltip?: string;
    onSelect: () => void;
    isActive: () => boolean;
}

export class FormattingToolbarItem extends ToolbarItem<FormattingToolbarItemProps> {


    override onMount(): void {
        this.registerEvent(this, EventTypes.MouseDown, (e: Event) => this.handleOnSelect(e, this.props.onSelect));
        this.registerEvent(this, EventTypes.KeyDown, (e: Event) => this.handleOnSelect(e, this.props.onSelect));

        this.handleSelectionChange();
    }

    handleOnSelect(event: Event, onSelect: () => void) {
        if (event instanceof KeyboardEvent) {
            if (event.key !== KeyboardKeys.Enter) return;
        }
        event.preventDefault();
        onSelect();
        this.handleSelectionChange();
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