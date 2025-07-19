import { push, remove } from "../core/editor-engine/index.ts";
import { Component } from "./component.ts";

// deno-lint-ignore no-explicit-any
export abstract class OverlayComponent<P = any, S = any> extends Component<P, S> {

    // zIndex: number = 1000;

    override connectedCallback(): void {
        super.connectedCallback();

        // this.style.zIndex = this.zIndex.toString();
        push(this);
    }

    override disconnectedCallback(): void {
        super.disconnectedCallback();
        remove(this);
    }
}