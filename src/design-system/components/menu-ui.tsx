/** @jsx h */


import { h, OverlayComponent } from "../../plugins/index.ts";

export class MenuUI extends OverlayComponent {

    static override styles = this.extendStyles(/*css*/`
        
        .guten-menu ul{
            margin: 0;
            padding: 0;
            padding: var(--space-sm) var(--space-sm);
            display: inline-flex;
            flex-direction: column;
            align-items: stretch;
            width: max-content;
            gap: 4px;
        }

        .guten-menu ul li{
            list-style: none;
            width: 100%;
            box-sizing: border-box;
        }
    `);

    override connectedCallback(): void {
        super.connectedCallback();
        this.setAttribute("class", "card animate-overlay");
    }

    render() {
        return (
            <div class="guten-menu">
                <ul>
                    {Array.isArray(this.props.children)
                        ? this.props.children.map((child, index) => <li key={index}>{child}</li>)
                        : <li>{this.props.children}</li>}
                </ul>
            </div>
        );
    }
}