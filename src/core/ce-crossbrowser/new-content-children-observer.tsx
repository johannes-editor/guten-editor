/** @jsx h */

import { h } from "../../jsx.ts";
import { Paragraph } from "../../components/blocks/paragraph.tsx";
import { DomUtils } from "../../utils/dom-utils.ts";

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

                        if (node.classList.contains("block")) continue;

                        try {

                            const p = <Paragraph />;
                            node.replaceWith(p);
                            DomUtils.focusOnElement(p);
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