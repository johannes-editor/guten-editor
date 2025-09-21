/** @jsx h */

import { Component } from "../../components/component.ts";
import { h } from "../../jsx.ts";
import { dom } from "../../utils/index.ts";

export abstract class InlineObjectPlaceholderUI extends Component {

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
        }
    ` );

    constructor(label: string) {
        super();

        this.label = label;
    }

    override connectedCallback(): void {
        super.connectedCallback();
        this.setAttribute("contenteditable", "false");
        this.classList.add("inline-object-placeholder", "unselectable", "pointer");

        this.registerEvent(this, dom.EventTypes.Click, () => this.onClick());
    }

    override render(): HTMLElement {
        return (
            <span>
                {this.label}
            </span>
        );
    }

    abstract onClick(): void;
}