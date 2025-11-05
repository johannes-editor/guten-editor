/** @jsx h */
import { h } from '../../../jsx.ts';

export function CodeBlock() {
    return (
        <div class="block code-block">
            <pre>
                <code class="empty placeholder" data-placeholder="/* Code snippet */"><br/></code>
            </pre>
        </div>
    );
}