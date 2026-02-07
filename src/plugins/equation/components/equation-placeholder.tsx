/** @jsx h */

import { t } from "@core/i18n/index.ts";
import { runCommand } from "@core/command/index.ts";
import { InlineObjectPlaceholderUI } from "@components/ui/primitives/placeholder/inline-object-placeholder-ui.tsx";

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