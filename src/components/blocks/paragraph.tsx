import { t } from "@core/i18n";
import { DefaultProps } from "@core/components";
import { generateBlockId } from "@utils/dom";

export function ParagraphBlock(props: DefaultProps): HTMLParagraphElement {
    return (
        <p
            data-block-id={generateBlockId()}
            className={`block paragraph guten-placeholder ${!props.children && "empty"}`}
            data-placeholder={t("start_typing")}
            data-placeholder-key="start_typing"
            {...props}
        >
            {props.children ?? <br />}
        </p>
    );
}