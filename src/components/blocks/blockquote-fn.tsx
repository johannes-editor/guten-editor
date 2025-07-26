/** @jsx h */

import { h } from "../../jsx.ts"
import { DefaultProps } from "../types.ts";

export function BlockquoteFn(props: DefaultProps) {
    return (
        <blockquote
            className={`block placeholder ${!props.children && "empty"}`}
            data-placeholder="To be or not to be"
            {...props}
        >
            {props.children ?? <br />}
        </blockquote>
    );
}