/** @jsx h */
import { h } from "../../../jsx.ts";
import { Component } from "../../../components/component.ts";

export interface SlashMenuItemProps {
    label: string;
    onSelect: () => void;
    selected: boolean;
    index: number;
    onMouseOver: (index: number) => void;
}


export class SlashMenuItem extends Component<SlashMenuItemProps> {

    static override styles = /*css*/ `
        ${this.getTagName} button {
            background-color: yellow;
            all: unset;
            display: flex;
            padding: .25rem 1rem ;
            border-radius: 5px;
            width: 100%;
            box-sizing: border-box;            
        }

        ${this.getTagName} button.selected {
            background-color: #f5f5f5;
        }
    `;

    render() {
        const className = this.props.selected ? "selected" : "";
        return <button
            type="button"
            part="button"
            class={className}
            onClick={this.props.onSelect}
            onMouseEnter={() => this.props.onMouseOver(this.props.index)}
        >
            {this.props.label}
        </button>;
    }
}