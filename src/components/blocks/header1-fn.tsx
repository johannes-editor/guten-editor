/** @jsx h */

import { t } from "../../core/i18n/index.ts";
import { h } from "../../jsx.ts"
import { DefaultProps } from "../types.ts";

export function Heading1Fn(props: DefaultProps) {
    return (
        <h1
            className={`block placeholder ${!props.children && "empty"}`}
            data-placeholder={t("heading1")}
            {...props}
        >
            {props.children ?? <br />}
        </h1>
    );
}