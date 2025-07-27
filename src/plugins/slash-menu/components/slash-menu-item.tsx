/** @jsx h */
import { h } from "../../../jsx.ts";
import { Component } from "../../../components/component.ts";

export interface SlashMenuItemProps {
    index: number;
    label: string;
    selected: boolean;
    onSelect: () => void;
    onMouseOver: (index: number) => void;
}

export class SlashMenuItem extends Component<SlashMenuItemProps> {

    static override getTagName(): string {
        return "x-slash-menu-item";
    }

    render() {
        const className = this.props.selected ? "selected" : "";
        return <button
            type="button"
            class={className}
            onClick={this.props.onSelect}
            onMouseEnter={() => this.props.onMouseOver(this.props.index)}
        >
            {this.props.label}
        </button>;
    }
}