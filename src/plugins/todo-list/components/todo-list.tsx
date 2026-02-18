import { generateBlockId } from "@utils/dom";
import { TodoListItem } from "./todo-list-item.tsx";

export function TodoListBlock(): HTMLUListElement {
    return (
        <ul
            className="block todo-list"
            data-block-id={generateBlockId()}
            contenteditable="false" >

            <TodoListItem />
        </ul>
    );
}