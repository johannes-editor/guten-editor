/** @jsx h */

import { h } from "../../jsx.ts";
import { ParagraphBlock } from "../../components/blocks/paragraph.tsx";
import { focusOnElement } from "../../utils/dom-utils.ts";
import { SchemaEnforcementObserver } from "../schema/schema-enforcement-observer.ts";

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
    private readonly schemaObserver: SchemaEnforcementObserver;

    constructor(private target: HTMLElement) {
        this.schemaObserver = new SchemaEnforcementObserver(target);
    }

    public start() {
        this.stop();

        this.schemaObserver.start();

        this.observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === "childList" && mutation.target === this.target) {
                    for (const node of Array.from(mutation.addedNodes)) {
                        if (!(node instanceof HTMLElement)) continue;

                        if (
                            node.classList.contains("block") ||
                            node.classList.contains("drag-placeholder")
                        ) continue;

                        try {
                            const enforced = this.schemaObserver.enforce(node, { isRootChild: true });
                            if (!enforced.classList.contains("block")) {
                                const fallback = <ParagraphBlock />;
                                node.replaceWith(fallback);
                                focusOnElement(fallback);
                            } else {
                                focusOnElement(enforced);
                            }
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
        this.schemaObserver.stop();
    }
}