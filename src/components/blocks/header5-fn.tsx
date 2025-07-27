/** @jsx h */

import { t } from "../../core/i18n/index.ts";
import { h } from "../../jsx.ts"
import { DefaultProps } from "../types.ts";

export function Heading5Fn(props: DefaultProps) {
    return (
        <h5
            className={`block placeholder ${!props.children && "empty"}`}
            data-placeholder={t("heading_5")}
            {...props}
        >
            {props.children ?? <br />}
        </h5>
    );
}