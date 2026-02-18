import { t } from "@core/i18n";
import { generateBlockId } from "@utils/dom";

export function CalloutBlock(): HTMLDivElement {
    return (
        <div data-block-id={generateBlockId()} class="block callout" data-callout-variant="warning">
            <p class="empty guten-placeholder" data-placeholder={t("blockquote_placeholder")} data-placeholder-key="blockquote_placeholder"><br /></p>
        </div>
    );
}