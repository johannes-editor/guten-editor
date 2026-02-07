/** @jsx h */

import { h } from "@core/jsx/index.ts";
import { DefaultProps } from "@core/components/types.ts";

export function SeparatorBlock(props: DefaultProps) : HTMLElement{
    return (
        <hr
            className="block block-separator"
            contentEditable="false"
            {...props}
        />
    );
}