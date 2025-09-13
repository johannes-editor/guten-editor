/** @jsx h */
import { h } from "../../jsx.ts";
import { Component } from "../../components/component.ts";
import { DefaultProps, DefaultState } from "../../components/types.ts";
import { dom, keyboard } from "../../utils/index.ts";

export interface MenuItemUIProps extends DefaultProps {
    icon?: HTMLElement;
    label?: string;
    shortcut?: string;
    onSelect: () => void;
}

export class MenuItemUI<P extends MenuItemUIProps, S = DefaultState> extends Component<P, S> {

    static override styles = this.extendStyles(/*css*/`
        .guten-menu-item {
            position: relative;
            display: inline-flex;
            width: 100%;
        }

        .guten-menu-item button {
            all: unset;
            padding: var(--space-xs);
            font-size: var(--font-size);            
        }

        .guten-menu-item button svg {
            display: block;
            width: var(--icon-size-sm);
            height: var(--icon-size-sm);
        }

        .guten-menu-item button:hover,
        .guten-menu-item button.selected,
        .guten-menu-item button:focus {
            background-color: var(--color-surface-muted);
            cursor: pointer;
            border-radius: var(--radius-sm);
        }

        .active button svg{
            color: var(--color-primary);            
        }

        .guten-menu-item:hover .tooltip {
            opacity: 1;
            transition-delay: 0.5s;
            display: flex;
        }

        .guten-menu-item button {
            display: flex;
            flex-direction: row;
            gap: var(--space-custom-10);
            color: var(--color-ui-text);
            white-space: nowrap;
            width: 100%;
            padding: var(--space-xs) var(--space-md);
            flex: 1;
            white-space: nowrap;
            box-sizing: border-box;
        }

        .guten-menu-item button span{
            display: block;
        }
        
    `);

    override connectedCallback(): void {
        super.connectedCallback();

        this.registerEvent(this, dom.EventTypes.MouseDown, (e: Event) => this.handleOnSelect(e, this.props.onSelect));
    }

    override render(): HTMLElement {
        const { icon, label } = this.props as MenuItemUIProps;

        return (
            <div class="guten-menu-item">
                <button type="button">
                    {icon} {label}
                </button>
            </div>
        );
    }

    handleOnSelect(event: Event, onSelect: () => void) {

        if (event instanceof KeyboardEvent) {
            if (event.key !== keyboard.KeyboardKeys.Enter) return;
        }

        event.preventDefault();

        onSelect();
    }
}
