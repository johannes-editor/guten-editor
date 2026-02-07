/** @jsx h */

import { h } from "@core/jsx";
import { t } from "@core/i18n";
import { DefaultProps } from "@core/components";

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