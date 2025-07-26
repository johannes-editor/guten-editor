/** @jsx h */

import { t } from "../../core/i18n/index.ts";
import { h } from "../../jsx.ts"
import { DefaultProps } from "../types.ts";

export function Heading4Fn(props: DefaultProps) {
    return (
        <h4
            className={`block placeholder ${!props.children && "empty"}`}
            data-placeholder={t("heading4")}
            {...props}
        >
            {props.children ?? <br />}
        </h4>
    );
}