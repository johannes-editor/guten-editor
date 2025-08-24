// If you prefer the global window.katex, remove this import and rely on a <script> include.
// With Vite+Deno you can import from npm:

import { Command, CommandContext } from "../../../core/command/command.ts";

/**
 * Command: renders LaTeX with KaTeX and inserts it at the current selection.
 *
 * Behavior:
 * - Requires a `latex` string in the command context.
 * - Optional `displayMode` (block math when true, inline otherwise).
 * - Uses `window.katex.renderToString()` to generate HTML.
 * - Inserts a non-editable wrapper (`<div.math-block>` or `<span.math-inline>`).
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

            console.log("katex:", katex);

            const latex: string = context.content?.latex ?? '';
            const displayMode: boolean = Boolean((context as any).displayMode);

            if (!latex) {
                console.warn("LaTeX is required to insert math.");
                return false;
            }

            const sel = context.selection ?? globalThis.getSelection();
            if (!sel || sel.rangeCount === 0) return false;

            const range = sel.getRangeAt(0);

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
                return false;
            }

            // Create wrapper node
            const tag = displayMode ? "div" : "span";
            const el = document.createElement(tag);
            el.className = displayMode ? "math-block" : "math-inline";
            el.setAttribute("data-latex", latex);
            el.setAttribute("contenteditable", "false");
            el.innerHTML = html;

            // const zwsBefore = document.createTextNode("\u200B");
            // const zwsAfter = document.createTextNode("\u200B");

            // const frag = document.createDocumentFragment();
            // frag.append(zwsBefore, el, zwsAfter);


            requestAnimationFrame(() => {
                // Insert at current selection/caret
                range.deleteContents();
                // range.insertNode(frag);
                range.insertNode(el);

                // Move caret after inserted node
                range.setStartAfter(el);
                range.setEndAfter(el);
                sel.removeAllRanges();
                sel.addRange(range);

                // For display math, ensure there's space to continue typing
                if (displayMode) {
                    const br = document.createElement("br");
                    el.parentElement?.insertBefore(br, el.nextSibling);
                }

            });

        });

        return true;
    }
};

export type InsertEquationPayload = { latex: string, displayMode: boolean }