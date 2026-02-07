import { t } from "@core/i18n";

export function CalloutBlock(): HTMLDivElement {
    return (
        <div class="block callout" data-callout-variant="warning">
            <p class="empty guten-placeholder" data-placeholder={t("blockquote_placeholder")} data-placeholder-key="blockquote_placeholder"><br /></p>
        </div>
    );
}