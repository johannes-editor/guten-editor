/** @jsx h */
import { h } from "../../jsx.ts";
import { Component } from "../../components/component.ts";
import { DefaultProps, DefaultState } from "../../components/types.ts";

export interface MenuItemUIProps extends DefaultProps {
    icon?: HTMLElement;
    label?: string;
    shortcut?: string;
}

export class MenuItemUI<P extends MenuItemUIProps = DefaultProps, S = DefaultState> extends Component<P, S> {

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
        }

        .guten-menu-item button:hover {
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

        .guten-menu-item button{
            display: flex;
            flex-direction: row;
            gap: var(--space-sm);

            white-space: nowrap;
            width: 100%;
            padding: var(--space-xs) var(--space-sm);

            flex: 1;
            white-space: nowrap;
            box-sizing: border-box;
        }

        .guten-menu-item button span{
            display: block;
        }
        
    `);

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
}
