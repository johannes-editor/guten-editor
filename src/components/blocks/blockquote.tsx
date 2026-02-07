import { t } from "@core/i18n";
import { DefaultProps } from "@core/components";

export function BlockquoteBlock(props: DefaultProps) : HTMLQuoteElement {
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