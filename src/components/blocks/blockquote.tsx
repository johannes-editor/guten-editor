/** @jsx h */

import { h } from "../../jsx.ts"
import { t } from "../../plugins/index.ts";
import { DefaultProps } from "../types.ts";

export function BlockquoteBlock(props: DefaultProps) {
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