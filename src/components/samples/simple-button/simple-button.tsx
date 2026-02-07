/** @jsx h */
import { h } from "@core/jsx";
import { Component } from "@core/components";

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
