// If you prefer the global window.katex, remove this import and rely on a <script> include.
// With Vite+Deno you can import from npm:

import { Command, CommandContext } from "../../../core/command/command.ts";
import { h } from "../../../jsx.ts";
import { EquationInline } from "../components/equation-inline.tsx";
import { EquationPlaceholder } from "../components/equation-placeholder.tsx";

/**
 * Command: renders LaTeX with KaTeX and inserts it at the current selection.
 *
 * Behavior:
 * - Requires a `latex` string in the command context.
 * - Optional `displayMode` (block math when true, inline otherwise).
 * - Uses `window.katex.renderToString()` to generate HTML.
 * - Wraps the output with {@link EquationInline}, which keeps metadata and reopens the editor when clicked.
 * - Moves the caret after the inserted node; if block, inserts a `<br>` to allow continued typing.
 *
 * Fails fast (returns false) when:
 * - `latex` is empty,
 * - no valid selection/range is present,
 * - KaTeX rendering throws.
 *
 * @param {CommandContext} context
 * @param {string} context.latex        LaTeX source to render.
 * @param {boolean} [context.displayMode=false]  Block/inline rendering.
 * @param {Selection|Range} [context.selection]  Optional selection to use; falls back to `window.getSelection()`.
 * @returns {boolean} True if the insertion flow was initiated.
 */
export const InsertEquation: Command = {
    id: "insertEquation",
    execute(context: CommandContext<InsertEquationPayload>): boolean {

        requestAnimationFrame(() => {

            const katex = (globalThis as any).katex;
            if (!katex || typeof katex.renderToString !== "function") {
                console.error("KaTeX is not available. Ensure the assets are loaded before inserting equations.");
                return;
            }

            const latex: string = (context.content?.latex ?? '').trim();
            const displayMode: boolean = Boolean(context.content?.displayMode);

            if (!latex) {
                console.warn("LaTeX is required to insert math.");
                return;
            }

            // Render KaTeX -> HTML
            let html = "";
            try {
                html = katex.renderToString(latex, {
                    displayMode,
                    throwOnError: false,
                    // output: "html", // optional (KaTeX >=0.16 supports output mode)
                });
            } catch (err) {
                console.error("KaTeX render error:", err);
                return;
            }

            const equationNode = h(EquationInline, {
                latex,
                displayMode,
                html,
            }) as HTMLElement;

            const target = context.content?.targetEquation ?? null;
            if (target instanceof HTMLElement) {
                const inlineHost = target.matches(EquationInline.getTagName())
                    ? target
                    : target.closest(EquationInline.getTagName());

                if (inlineHost) {
                    inlineHost.replaceWith(equationNode);
                    moveCaretAfter(equationNode, displayMode);
                    return;
                }

                const placeholderHost = target.matches(EquationPlaceholder.getTagName())
                    ? target
                    : target.closest(EquationPlaceholder.getTagName());

                if (placeholderHost) {
                    placeholderHost.replaceWith(equationNode);
                    moveCaretAfter(equationNode, displayMode);
                    return;
                }

                const mathWrapper = target.closest('[data-latex], .math-inline, .math-block, .katex, .katex-display') as HTMLElement | null;
                if (mathWrapper) {
                    mathWrapper.replaceWith(equationNode);
                    moveCaretAfter(equationNode, displayMode);
                    return;
                }
            }

            const sel = context.selection ?? globalThis.getSelection();
            if (!sel || sel.rangeCount === 0) return;

            const range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(equationNode);

            moveCaretAfter(equationNode, displayMode, range, sel);
        });

        return true;
    }
};

function moveCaretAfter(node: Node, displayMode: boolean, range?: Range, sel?: Selection | null) {
    const selection = sel ?? globalThis.getSelection();
    const workingRange = range ?? document.createRange();

    workingRange.setStartAfter(node);
    workingRange.collapse(true);

    selection?.removeAllRanges();
    selection?.addRange(workingRange);

    if (displayMode) {
        const parent = node.parentElement;
        if (parent) {
            const next = node.nextSibling;
            if (!(next instanceof HTMLBRElement)) {
                const br = document.createElement("br");
                parent.insertBefore(br, next ?? null);
            }
        }
    }
}

export type InsertEquationPayload = {
    latex: string;
    displayMode: boolean;
    targetEquation?: HTMLElement | null;
};