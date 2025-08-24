/** @jsx h */
import { h } from "../../../jsx.ts";
import { Component } from "../../../components/component.ts";
import { ClassName } from "../../../utils/dom/class-name.ts";

export class TodoItem extends Component {

    render() {
        return (
            <li>
                <input id="abc" type="checkbox" />
                <span class={`${ClassName.Placeholder} ${ClassName.Empty}`} data-placeholder="Item" contentEditable="true"><br /></span>
            </li>
        );
    }
}