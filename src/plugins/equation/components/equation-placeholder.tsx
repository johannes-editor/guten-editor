/** @jsx h */

import { runCommand, t } from "../../index.ts";
import { InlineObjectPlaceholderUI } from "../../../design-system/components/inline-object-placeholder-ui.tsx";

export class EquationPlaceholder extends InlineObjectPlaceholderUI {

    constructor() {
        super(t("equation"));
    }

    override onMount(): void {
        this.dataset.equationPlaceholder = "true";
    }

    override onClick(): void {
        const selection = globalThis.getSelection();
        if (selection) {
            const range = document.createRange();
            range.selectNode(this);
            selection.removeAllRanges();
            selection.addRange(range);
        }

        runCommand("openEquationPopover", {
            content: {
                targetEquation: this,
            },
        });
    }
}