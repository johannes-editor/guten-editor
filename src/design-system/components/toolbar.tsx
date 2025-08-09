/** @jsx h */
import { DefaultState } from "../../components/types.ts";
import { h } from "../../jsx.ts";
import { DefaultProps, OverlayComponent } from "../../plugins/index.ts";

export class Toolbar<P extends DefaultProps = DefaultProps, S = DefaultState> extends OverlayComponent<P, S> {

    static override styles? = /*css*/ `
        .guten-toolbar ul{
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: row;
            gap: 0.5rem;
            padding: 0;
        }

        .guten-toolbar li{
            list-style: none;
        }
    `;

    override connectedCallback(): void {
        super.connectedCallback();
        this.setAttribute("class", "guten-toolbar card");
    }

    override render(): HTMLElement {
        return (
            <div>
                <ul>
                    {this.props.children}
                </ul>
            </div>
        );
    }
}
