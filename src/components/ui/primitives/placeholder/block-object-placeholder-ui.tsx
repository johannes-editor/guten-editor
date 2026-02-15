import { Component } from "@core/components";
import { EventTypes } from "@utils/dom";
import { KeyboardKeys } from "@utils/keyboard";

export abstract class BlockObjectPlaceholderUI extends Component {

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
            font-size: var(--font-size-sm);
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

        this.registerEvent(this, EventTypes.Click, (event) => {
            const e = event as MouseEvent;
            if (e.detail !== 2) return;

            this.onSelect(event as MouseEvent)
        });

        this.registerEvent(this, EventTypes.KeyDown, (event) => {
            const e = event as KeyboardEvent;

            if (e.key == KeyboardKeys.Enter) {
                this.onSelect(event as MouseEvent)
            }
        });
    }

    override render(): HTMLElement {
        return (
            <div>
                {this.icon}
                <span> {this.label}</span>
            </div>
        );
    }

    abstract onSelect(event: MouseEvent): void;
}