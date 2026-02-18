import { ParagraphBlock } from "../../components/blocks/paragraph.tsx";
import { ensureBlockId, focusOnElementAtStart, generateBlockId } from "@utils/dom";

/**
 * Observes the insertion of new blocks directly into the contentEditable DOM (e.g., when pressing Enter).
 *
 * Its purpose is to neutralize inconsistent browser behavior, where pressing Enter may:
 *   - Insert unexpected elements like <div>, <h1>, or replicate the previous block's tag
 *   - Create structural inconsistencies across different browsers
 *
 * This observer ensures that every new element inserted via Enter is always a <p class="block">,
 * enforcing the editor’s standard block structure.
 */
export class NewContentChildrenObserver {

    private observer: MutationObserver | null = null;

    constructor(private target: HTMLElement) { }

    public start() {
        this.stop();

        this.observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === "childList" && mutation.target === this.target) {
                    for (const node of Array.from(mutation.addedNodes)) {
                        if (!(node instanceof HTMLElement)) continue;

                        if (node.classList.contains("drag-placeholder")) continue;

                        if (node.classList.contains("block")) {
                            const blockId = node.dataset.blockId;
                            const hasDuplicatedId =
                                !!blockId &&
                                Array.from(this.target.querySelectorAll<HTMLElement>("[data-block-id]"))
                                    .filter((element) => element.dataset.blockId === blockId).length > 1;

                            if (hasDuplicatedId) {
                                node.dataset.blockId = generateBlockId();
                            } else {
                                ensureBlockId(node);
                            }

                            continue;
                        }

                        try {

                            const p = <ParagraphBlock />;
                            node.replaceWith(p);
                            focusOnElementAtStart(p);
                        } catch (e) {
                            console.error("Error:", e);
                        }
                    }
                }
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