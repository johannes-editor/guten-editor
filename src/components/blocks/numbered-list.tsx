/** @jsx h */

import { h } from "../../jsx.ts";
import { t } from "../../plugins/index.ts";
import { DefaultProps } from "../types.ts";

export function NumberedListBlock(props: DefaultProps) {
    return (
        <ol
            className="block"
            {...props}
        >
            {props.children ?? <li className="guten-placeholder empty" 
                                data-placeholder={t("list_item")} 
                                data-placeholder-key="list_item"><br /></li>}
        </ol>
    );
}