/** @jsx h */

import { TodoItem } from "./todo-item.tsx";
import { h, Component, focusOnElement, KeyboardKeys } from "../../index.ts";

export class TodoList extends Component {

    override onMount() {
        this.registerEvent(this, "keydown", this.handleKeyDown as EventListener);
    }

    override render(): HTMLElement {
        return (
            <ul class="block todo-list" contentEditable="false">
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
            focusOnElement(span);
        }
    }
}