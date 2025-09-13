/** @jsx h */

import { Component } from "../../components/component.ts";
import { h } from "../../jsx.ts";

export abstract class ObjectPlaceholderUI extends Component {

    icon: SVGElement;
    label: string;

    static override styles = this.extendStyles(/*css */`
        
        .object-placeholder {
            display: flex;
            align-items: center;
            box-sizing: border-box;
            background: var(--placeholder-bg);
            border-radius: var(--radius-sm);
            gap: var(--space-sm);
        }

        .object-placeholder div {
            display: flex;
            flex-direction: row;
            vertical-align: middle;
            align-items: center; 
            color: var(--color-muted);
            padding: var(--space-md);
            gap: var(--space-sm);
            width: 100%;
        }

        .object-placeholder div svg {
            width: var(--font-size-lg);
            height: var(--font-size-lg);
            display: block;
        }        

        .object-placeholder div span {
            line-height: 1;
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
        this.classList.add("block", "object-placeholder", "unselectable", "pointer");

        this.registerEvent(this, "click", () => this.onClick());
    }

    override render(): HTMLElement {
        return (
            <div>
                {this.icon}
                <span> {this.label}</span>
            </div>
        );
    }

    abstract onClick(): void;
}