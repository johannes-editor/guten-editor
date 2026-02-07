/** @jsx h */

import { h } from '@/core/jsx/index.ts';
import { t } from "@core/i18n";

export function CodeBlock() : HTMLDivElement {
    return (
        <div class="block code-block">
            <pre>
                <code class="empty guten-placeholder" 
                    data-placeholder={t("code_block_placeholder")} 
                    data-placeholder-key="code_block_placeholder"><br/></code>
            </pre>
        </div>
    );
}