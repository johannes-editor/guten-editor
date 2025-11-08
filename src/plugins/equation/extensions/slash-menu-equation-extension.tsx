/** @jsx h */

import { EquationIcon } from "../../../design-system/components/icons.tsx";
import { focusOnElement, h, runCommand, t } from "../../index.ts";
import { SelectionUtils } from "../../../utils/selection/selection-utils.ts";
import { SlashMenuExtensionPlugin } from "../../slash-menu/index.ts";
import { EquationPlaceholder } from "../components/equation-placeholder.tsx";

export class SlashMenuEquationExtension extends SlashMenuExtensionPlugin {

    icon: SVGElement = <EquationIcon />;
    label: string = t("equation");
    sort: number = 60;

    onSelect(focusedBlock: HTMLElement): void {
        const placeholder: HTMLElement = <EquationPlaceholder />;

        let range = SelectionUtils.getCurrentSelectionRange();
        if (!range || !focusedBlock.contains(range.startContainer)) {
            range = document.createRange();
            range.selectNodeContents(focusedBlock);
            range.collapse(false);
        } else if (!range.collapsed) {
            range.collapse(false);
        }

        range.insertNode(placeholder);

        const selection = globalThis.getSelection();
        
        if (selection) {
            const placeholderRange = document.createRange();
            placeholderRange.selectNode(placeholder);
            selection.removeAllRanges();
            selection.addRange(placeholderRange);
        }

        focusOnElement(focusedBlock);
        runCommand("openEquationPopover", {
            content: {
                targetEquation: placeholder,
            },
        });
    }

}