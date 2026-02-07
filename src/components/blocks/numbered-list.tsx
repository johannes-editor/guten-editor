/** @jsx h */

import { h } from "@core/jsx";
import { t } from "@core/i18n";
import { DefaultProps } from "@core/components";

export function NumberedListBlock(props: DefaultProps) : HTMLElement{
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