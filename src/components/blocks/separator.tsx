/** @jsx h */

import { h } from "../../jsx.ts";
import { DefaultProps } from "../types.ts";

export function SeparatorBlock(props: DefaultProps) {
    return (
        <hr
            className="block block-separator"
            contentEditable="false"
            {...props}
        />
    );
}