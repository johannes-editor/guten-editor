import { t } from "@core/i18n";
import { DefaultProps } from "@core/components";
import { generateBlockId } from "@utils/dom";

export function BlockquoteBlock(props: DefaultProps): HTMLQuoteElement {
    return (
        <blockquote
            data-block-id={generateBlockId()}
            className={`block guten-placeholder ${!props.children && "empty"}`}
            data-placeholder={t("blockquote_placeholder")}
            data-placeholder-key="blockquote_placeholder"
            {...props}
        >
            {props.children ?? <br />}
        </blockquote>
    );
}