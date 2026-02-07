/** @jsx h */

import { h } from "@core/jsx/index.ts";
import { t } from "@core/i18n/index.ts";
import { ClassName } from "@utils/dom/index.ts";


function adoptToDocument<T extends Node>(doc: Document, node: T): T {
    if (node.ownerDocument !== doc && "adoptNode" in doc) {
        return doc.adoptNode(node) as T;
    }
    return node;
}

function TodoItem() {
    return (
        <li>
            <input type="checkbox" />
            <span
                contenteditable="true"
                data-placeholder={t("list_item")}
                className={`${ClassName.Placeholder} ${ClassName.Empty}`}
            >
                <br />
            </span>
        </li>
    );
}

function TodoList() {
    return (
        <ul className={`${ClassName.Block} todo-list`} contenteditable="false" />
    );
}

export function createTodoItem(doc: Document): HTMLLIElement {
    const item = adoptToDocument(doc, <TodoItem /> as HTMLLIElement);
    return item;
}

export function createTodoList(doc: Document, items?: HTMLLIElement[]): HTMLUListElement {
    const list = adoptToDocument(doc, <TodoList /> as HTMLUListElement);

    if (items && items.length > 0) {
        for (const item of items) {
            list.append(adoptToDocument(doc, item));
        }
    } else {
        list.append(createTodoItem(doc));
    }

    return list;
}