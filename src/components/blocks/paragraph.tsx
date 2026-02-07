/** @jsx h */

import { h } from "@core/jsx";
import { t } from "@core/i18n";
import { DefaultProps } from "@core/components";

export function ParagraphBlock(props: DefaultProps) : HTMLElement{
    return (
        <p
            className={`block guten-placeholder ${!props.children && "empty"}`}
            data-placeholder={t("start_typing")}
            data-placeholder-key="start_typing"
            {...props}
        >
            {props.children ?? <br />}
        </p>
    );
}