/** @jsx h */

import { t } from "../../core/i18n/index.ts";
import { h } from "../../jsx.ts"
import { DefaultProps } from "../types.ts";

export function Heading3Block(props: DefaultProps) {
    return (
        <h3
            className={`block placeholder ${!props.children && "empty"}`}
            data-placeholder={t("heading_3")}
            data-placeholder-key="heading_3"
            {...props}
        >
            {props.children ?? <br />}
        </h3>
    );
}