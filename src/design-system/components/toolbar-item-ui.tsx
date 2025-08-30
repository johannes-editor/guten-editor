/** @jsx h */
import { h } from "../../jsx.ts";
import { Component } from "../../components/component.ts";
import { DefaultProps, DefaultState } from "../../components/types.ts";
import { Tooltip } from "./tooltip.tsx";

interface ToolbarItemUIProps extends DefaultProps {
    icon?: HTMLElement;
    label?: string;
    shortcut?: string;
}

export class ToolbarItemUI<P extends ToolbarItemUIProps = DefaultProps, S = DefaultState> extends Component<P, S> {

    static override styles = this.extendStyles(/*css*/`
        .guten-toolbar-item {
            position: relative;
            display: inline-flex;
        }

        .guten-toolbar-item button {
            all: unset;
            padding: var(--space-xs);
            font-size: var(--font-size);
        }

        .guten-toolbar-item button svg {
            display: block !important;
            width: var(--icon-size-xl) !important;
            height: var(--icon-size-xl) !important;
        }

        .guten-toolbar-item button:hover {
            background-color: var(--color-surface-muted);
            cursor: pointer;
            border-radius: var(--radius-sm);
        }

        .active button svg{
            color: var(--color-primary);
        }

        .guten-toolbar-item:hover .tooltip {
            opacity: 1;
            transition-delay: 0.5s;
            display: flex;
        }
    `);

    override connectedCallback(): void {
        super.connectedCallback();
        this.setAttribute("class", "guten-toolbar-item");
    }

    override render(): HTMLElement {
        const { icon, label, shortcut, children } = this.props as ToolbarItemUIProps;

        return (
            <div>
                <Tooltip
                    text={label}
                    shortcut={shortcut}
                    placement="top"
                    offset={8} >
                    <button type="button">
                        {icon ?? children}
                    </button>
                </Tooltip>
            </div>
        );
    }
}
