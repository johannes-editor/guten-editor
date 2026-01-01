/** @jsx h */

import { t } from "../../core/i18n/index.ts";
import { h } from "../../jsx.ts"
import { DefaultProps } from "../types.ts";

export function Heading1Block(props: DefaultProps) {
    return (
        <h1
            className={`block placeholder ${!props.children && "empty"}`}
            data-placeholder={t("heading_1")}
            data-placeholder-key="heading_1"
            {...props}
        >
            {props.children ?? <br />}
        </h1>
    );
}