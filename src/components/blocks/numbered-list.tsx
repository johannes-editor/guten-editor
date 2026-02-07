/** @jsx h */

import { h } from "@core/jsx/index.ts";
import { t } from "@core/i18n/index.ts";
import { DefaultProps } from "@core/components/types.ts";

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