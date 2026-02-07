/** @jsx h */

import { h } from "@core/jsx/index.ts";
import { t } from "@core/i18n/index.ts";
import { DefaultProps } from "@core/components/types.ts";

export function BulletedListBlock(props: DefaultProps) : HTMLElement{
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