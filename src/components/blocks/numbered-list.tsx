import { t } from "@core/i18n";
import { DefaultProps } from "@core/components";
import { generateBlockId } from "@utils/dom";

export function NumberedListBlock(props: DefaultProps): HTMLOListElement {
    return (
        <ol
            data-block-id={generateBlockId()}
            className="block"
            {...props}
        >
            {props.children ?? <li className="guten-placeholder empty"
                data-placeholder={t("list_item")}
                data-placeholder-key="list_item"><br /></li>}
        </ol>
    );
}