import { h } from "@core/jsx";
import { t } from "@core/i18n";
import { Command, CommandContext } from "@core/command";
import { EquationInline } from "../components/equation-inline.tsx";
import { EquationPlaceholder } from "../components/equation-placeholder.tsx";
import { createEquationElement } from "../utils/equation-element.ts";

/**
 * Command: renders LaTeX with KaTeX and inserts it at the current selection.
 *
 * Behavior:
 * - Requires a `latex` string in the command context.
 * - Optional `displayMode` (block math when true, inline otherwise).
 * - Uses `window.katex.renderToString()` to generate HTML.
 * - Wraps the output with a standard HTML element that stores the LaTeX metadata.
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

            const createEquationNode = (doc?: Document) =>
                createEquationElement({
                    latex,
                    displayMode,
                    html,
                    doc,
                    ariaLabel: t("equation"),
                });

            const target = context.content?.targetEquation ?? null;
            if (target instanceof HTMLElement) {
                

                const placeholderHost = target.matches(EquationPlaceholder.getTagName())
                    ? target
                    : target.closest(EquationPlaceholder.getTagName());

                if (placeholderHost) {
                    const equationNode = createEquationNode(placeholderHost.ownerDocument ?? document);
                    placeholderHost.replaceWith(equationNode);
                    moveCaretAfter(equationNode, displayMode);
                    return;
                }

                const mathWrapper = target.closest('[data-latex], .math-inline, .math-block, .katex, .katex-display') as HTMLElement | null;
                if (mathWrapper) {
                    const equationNode = createEquationNode(mathWrapper.ownerDocument ?? document);
                    mathWrapper.replaceWith(equationNode);
                    moveCaretAfter(equationNode, displayMode);
                    return;
                }
            }

            const sel = context.selection ?? globalThis.getSelection();
            if (!sel || sel.rangeCount === 0) return;

            const range = sel.getRangeAt(0);
            range.deleteContents();
            const equationNode = createEquationNode(range.startContainer.ownerDocument ?? document);
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