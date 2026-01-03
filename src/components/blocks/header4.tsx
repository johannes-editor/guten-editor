/** @jsx h */

import { t } from "../../core/i18n/index.ts";
import { h } from "../../jsx.ts"
import { DefaultProps } from "../types.ts";

export function Heading4Block(props: DefaultProps) {
    return (
        <h4
            className={`block guten-placeholder ${!props.children && "empty"}`}
            data-placeholder={t("heading_4")}
            data-placeholder-key="heading_4"
            {...props}
        >
            {props.children ?? <br />}
        </h4>
    );
}