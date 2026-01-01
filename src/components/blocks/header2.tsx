/** @jsx h */

import { t } from "../../core/i18n/index.ts";
import { h } from "../../jsx.ts"
import { DefaultProps } from "../types.ts";

export function Heading2Block(props: DefaultProps) {
    return (
        <h2
            className={`block placeholder ${!props.children && "empty"}`}
            data-placeholder={t("heading_2")}
            data-placeholder-key="heading_2"
            {...props}
        >
            {props.children ?? <br />}
        </h2>
    );
}