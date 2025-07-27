/** @jsx h */
import { h } from "../../../jsx.ts";
import { Component } from "../../../components/component.ts";
import { ClassName } from "../../../constants/class-name.ts";
import { DataSkip } from "../../../constants/data-skip.ts";
import { TodoItem } from "./todo-item.tsx";
import { DomUtils } from "../../../utils/dom-utils.ts";
import { KeyboardKeys } from "../../../constants/keyboard-keys.ts";

export class TodoList extends Component {

    override onMount() {
        this.registerEvent(this, "keydown", this.handleKeyDown as EventListener);
    }

    override render(): HTMLElement {
        return (
            <ul class={`${ClassName.Block} todo-list`} data-skip={DataSkip.BlockInsertionNormalizer} contentEditable="false">
                <TodoItem />
            </ul>
        );
    }

    private handleKeyDown = (e: KeyboardEvent): void => {
        if (e.key === KeyboardKeys.Enter) {
            e.preventDefault();
            this.addTodoItem();
        }
    };

    private addTodoItem(): void {

        const ul = this.querySelector("ul");

        if (ul) {
            const element: HTMLElement = <TodoItem />
            ul.appendChild(element);

            const span = element.querySelector("span");
            DomUtils.focusOnElement(span);
        }
    }

}