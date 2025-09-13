/** @jsx h */
import { h } from "../../../jsx.ts";
import { Component } from "../../../components/component.ts";

export interface SlashMenuItemProps {
    icon: SVGAElement;
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

    static override styles = this.extendStyles(/*css */`
        
        .guten-menu-item-x{
            cursor: pointer;
        }

        .guten-menu-item-x button {
            display: flex;
            align-items: center;
            color: var(--color-ui-text);
            gap: var(--space-custom-10);
        }

        .guten-menu-item-x button span {
            flex: 1;
            white-space: nowrap;
            box-sizing: border-box;
            vertical-align: middle;
        }

        .guten-menu-item-x button svg {
            display: block;
            width: var(--icon-size-sm);
            height: var(--icon-size-sm);
        }

    ` );

    render() {
        const className = this.props.selected ? "selected" : "";
        return (
            <div class="guten-menu-item-x">
                <button
                    type="button"
                    class={className}
                    onClick={this.props.onSelect}
                    onMouseEnter={() => this.props.onMouseOver(this.props.index)}
                >
                    {this.props.icon} <span>{this.props.label}</span>
                </button>
            </div>);
    }
}