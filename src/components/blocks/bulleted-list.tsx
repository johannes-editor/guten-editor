/** @jsx h */

import { h } from "../../jsx.ts";
import { t } from "../../plugins/index.ts";
import { DefaultProps } from "../types.ts";

export function BulletedListBlock(props: DefaultProps) {
    return (
        <ul
            className="block"
            data-placeholder={t("list_item_placeholder")}
            data-placeholder-key="list_item_placeholder"
            {...props}
        >
            {props.children ?? <li className="guten-placeholder empty" data-placeholder={t("list_item")} data-placeholder-key="list_item"><br /></li>}
        </ul>
    );
}