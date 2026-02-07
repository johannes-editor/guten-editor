/** @jsx h */

import { h } from "@core/jsx";
import { DefaultState, DefaultProps } from "@core/components";
import { OverlayComponent } from "@components/editor/overlay";

export class ToolbarUI<P extends DefaultProps = DefaultProps, S = DefaultState> extends OverlayComponent<P, S> {

    static override styles = this.extendStyles(/*css*/`
        .guten-toolbar{
            border-radius: var(--toolbar-radius);
        }
        
        .guten-toolbar ul{
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: row;
            gap: 10px;
        }

        .guten-toolbar li{
            list-style: none;
        }
    `);

    override connectedCallback(): void {
        super.connectedCallback();
        this.setAttribute("class", "guten-toolbar card animate-overlay");
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
