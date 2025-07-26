/** @jsx h */

import { t } from "../../core/i18n/index.ts";
import { h } from "../../jsx.ts"
import { DefaultProps } from "../types.ts";

export function ParagraphFn(props: DefaultProps) {
    return (
        <p
            className={`block placeholder ${!props.children && "empty"}`}
            data-placeholder={t("startTyping")}
            {...props}
        >
            {props.children ?? <br />}
        </p>
    );
}