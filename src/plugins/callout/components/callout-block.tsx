/** @jsx h */
import { h } from '../../../jsx.ts';
import { t } from "../../index.ts";

export function CalloutBlock() {
    return (
        <div class="block callout">
            <p class="empty guten-placeholder" data-placeholder={t("blockquote_placeholder")} data-placeholder-key="blockquote_placeholder"><br/></p>
        </div>
    );
}