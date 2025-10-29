/** @jsx h */
import { h } from "../../../jsx.ts";
import { OverlayComponent } from "../../../components/overlay/overlay-component.ts";

export class BlockOptions extends OverlayComponent {
    static override styles = this.extendStyles(/*css*/`
        .block-options {
            background: #fff;
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 8px 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            font-family: sans-serif;
            font-size: 14px;
        }
    `);

    render() {
        return <div class="block-options">Block options placeholder</div>;
    }
}
