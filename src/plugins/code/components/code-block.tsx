/** @jsx h */
import { h } from '../../../jsx.ts';
import { t } from "../../index.ts";

export function CodeBlock() {
    return (
        <div class="block code-block">
            <pre>
                <code class="empty placeholder" 
                    data-placeholder={t("code_block_placeholder")} 
                    data-placeholder-key="code_block_placeholder"><br/></code>
            </pre>
        </div>
    );
}