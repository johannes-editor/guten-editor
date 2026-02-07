/** @jsx h */
import { h } from "@core/jsx/index.ts";
import { Component } from "@core/components/component.ts";

export class SimpleButton extends Component {

    // static styles = /*css*/ `
    //     button {
    //         background-color: yellow;
    //     }
    // `;

    text: string = "Just a button";

    render() {
        return <button type="button">{this.text}</button>;
    }
}
