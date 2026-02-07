/** @jsx h */

import { h } from "@/core/jsx/index.ts";
import { t } from "@core/i18n/index.ts";
import { DefaultProps } from "@core/components/types.ts";

export function BlockquoteBlock(props: DefaultProps) : HTMLQuoteElement {
    return (
        <blockquote
            className={`block guten-placeholder ${!props.children && "empty"}`}
            data-placeholder={t("blockquote_placeholder")}
            data-placeholder-key="blockquote_placeholder"
            {...props}
        >
            {props.children ?? <br />}
        </blockquote>
    );
}