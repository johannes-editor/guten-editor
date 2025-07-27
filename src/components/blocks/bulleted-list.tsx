/** @jsx h */

import { h } from "../../jsx.ts";
import { DefaultProps } from "../types.ts";

export function BulletedList(props: DefaultProps) {
    return (
        <ul
            className="block"
            data-placeholder="List item"
            {...props}
        >
            {props.children ?? <li className="placeholder empty" data-placeholder="Item"><br /></li>}
        </ul>
    );
}