import { t } from "@core/i18n";
import { runCommand } from "@core/command";
import { EquationIcon } from "@components/ui/icons";
import { focusOnElement } from "@utils/dom";
import { getCurrentSelectionRange } from "@utils/selection";
import { SlashMenuExtensionPlugin } from "@plugins/slash-menu";
import { EquationPlaceholder } from "../components/equation-placeholder.tsx";

export class SlashMenuEquationExtension extends SlashMenuExtensionPlugin {

    icon: SVGElement = <EquationIcon />;
    label: string = t("equation");
    sort: number = 60;

    onSelect(focusedBlock: HTMLElement): void {
        const placeholder: HTMLElement = <EquationPlaceholder />;

        let range = getCurrentSelectionRange();
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