/** @jsx h */

import { Component } from "../../components/component.ts";
import { Fragment, h } from "../../jsx.ts";

export abstract class InlineObjectPlaceholderUI extends Component {

    icon: SVGElement;
    label: string;

    static override styles = this.extendStyles(/*css */`
        
        .inline-object-placeholder {
            display: inline-block;
            height: 100%;
            align-items: center;
            box-sizing: border-box;
            background: var(--placeholder-bg);
            border-radius: var(--radius-sm);
            padding: 0 4px;
            font-size: 1rem;

            svg {
                position: relative;
                top: 2px;
                height: .875rem;
                width: .875rem;
                display: inline-block;
                margin: auto 0;
            }
        }

    ` );

    constructor(icon: SVGElement, label: string) {
        super();

        this.icon = icon;
        this.label = label;
    }

    override connectedCallback(): void {
        super.connectedCallback();
        this.setAttribute("contenteditable", "false");
        this.classList.add("inline-object-placeholder", "unselectable", "pointer");

        this.registerEvent(this, "click", () => this.onClick());
    }

    override render(): HTMLElement {
        return (
            <Fragment>
                {this.icon} {this.label}
            </Fragment>
        );
    }

    abstract onClick(): void;
}