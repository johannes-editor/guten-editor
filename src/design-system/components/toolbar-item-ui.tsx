/** @jsx h */
import { h } from "../../jsx.ts";
import { Component } from "../../components/component.ts";
import { DefaultProps, DefaultState } from "../../components/types.ts";

interface ToolbarItemUIProps extends DefaultProps {
    icon?: HTMLElement;
    tooltip?: string;
}

export class ToolbarItemUI<P extends ToolbarItemUIProps = DefaultProps, S = DefaultState> extends Component<P, S> {

    static override styles = this.extendStyles(/*css*/`

        .guten-toolbar-item button svg{
            display: block !important;
        }

        .guten-toolbar-item button {
            all: unset;
            padding: var(--space-xs);
            font-size: var(--font-size);
        }

        .guten-toolbar-item button svg {
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
    `);

    override connectedCallback(): void {
        super.connectedCallback();
        this.setAttribute("class", "guten-toolbar-item");
    }

    override render(): HTMLElement {
        const { icon, tooltip, children } = this.props;
        return (

            <button type="button" title={tooltip}>
                {icon ?? children}
            </button>
        );
    }
}