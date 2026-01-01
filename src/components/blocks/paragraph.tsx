/** @jsx h */

import { t } from "../../core/i18n/index.ts";
import { h } from "../../jsx.ts"
import { DefaultProps } from "../types.ts";

export function ParagraphBlock(props: DefaultProps) {
    return (
        <p
            className={`block placeholder ${!props.children && "empty"}`}
            data-placeholder={t("start_typing")}
            data-placeholder-key="start_typing"
            {...props}
        >
            {props.children ?? <br />}
        </p>
    );
}