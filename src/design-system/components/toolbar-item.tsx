/** @jsx h */
import { h } from "../../jsx.ts";
import { Component } from "../../components/component.ts";
import { DefaultProps, DefaultState } from "../../components/types.ts";

interface ToolbarItemProps extends DefaultProps {
    icon?: HTMLElement;
    tooltip?: string;
}

export class ToolbarItem<P extends ToolbarItemProps = DefaultProps, S = DefaultState> extends Component<ToolbarItemProps, DefaultState> {

    static override styles = /*css*/`

        .active button svg{
            color: blue;
        }
    `;

    override render(): HTMLElement {
        const { icon, tooltip, children } = this.props;
        return (

            <button type="button" title={tooltip}>
                {icon ?? children}
            </button>

        );
    }
}