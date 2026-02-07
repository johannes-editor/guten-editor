/** @jsx h */

import { h } from "@core/jsx";
import { DefaultProps } from "@core/components";

export function SeparatorBlock(props: DefaultProps) : HTMLElement{
    return (
        <hr
            className="block block-separator"
            contentEditable="false"
            {...props}
        />
    );
}