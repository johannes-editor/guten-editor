import { ClassName } from "../../constants/class-name.ts";
import { DataSkip } from "../../constants/data-skip.ts";
import { DomUtils } from "../../utils/dom-utils.ts";

/**
 * Observes the insertion of new blocks directly into the contentEditable DOM (e.g., when pressing Enter).
 * 
 * Its purpose is to neutralize inconsistent browser behavior, where pressing Enter may:
 *   - Insert unexpected elements like <div>, <h1>, or replicate the previous block's tag
 *   - Create structural inconsistencies across different browsers
 * 
 * This observer ensures that every new element inserted via Enter is always a <p class="block-root">,
 * enforcing the editor’s standard block structure.
 * 
 * It also removes temporary attributes like data-skip="block-insertion-normalizer" used for internal control.
 */
export class NewContentChildrenObserver {

    private observer: MutationObserver | null = null;

    constructor(private target: HTMLElement) { }

    public start() {
        this.stop();

        this.observer = new MutationObserver((mutations) => {
            const toClean: HTMLElement[] = [];

            for (const mutation of mutations) {
                if (mutation.type === "childList" && mutation.target === this.target) {
                    for (const node of Array.from(mutation.addedNodes)) {
                        if (!(node instanceof HTMLElement)) continue;

                        const skip = node.getAttribute("data-skip");
                        if (skip === DataSkip.BlockInsertionNormalizer) {
                            toClean.push(node);
                            continue;
                        }

                        const isValid = node.tagName === "P" && node.classList.contains(ClassName.Block);
                        if (isValid) continue;

                        const replacement = document.createElement("p");
                        replacement.classList.add(ClassName.Block);
                        replacement.classList.add(ClassName.Placeholder);
                        replacement.dataset.placeholder = "Start typing...";
                        replacement.innerHTML = node.innerHTML;

                        try {
                            node.replaceWith(replacement);
                            DomUtils.focusOnElement(replacement);
                        } catch (e) {
                            console.error("Error:", e);
                        }
                    }
                }
            }

            for (const node of toClean) {
                node.removeAttribute("data-skip");
            }
        });

        this.observer.observe(this.target, {
            childList: true,
            subtree: false,
        });
    }

    public stop() {
        this.observer?.disconnect();
        this.observer = null;
    }
}