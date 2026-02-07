

import { t } from "@core/i18n/index.ts";
import { Plugin } from "@core/plugin-engine/plugin.ts";
import { runCommand } from "@core/command/index.ts";
import { closestEquationElement, EQUATION_DATA_ATTRIBUTE, isEquationElement } from "../utils/equation-element.ts";

export class EquationClickPlugin extends Plugin {

    private contentArea: HTMLElement | null = null;

    override setup(root: HTMLElement): void {
        this.teardown();

        const contentArea = root.querySelector<HTMLElement>("#contentArea");
        if (!contentArea) {
            console.warn("[EquationClickPlugin] Unable to find #contentArea in editor root.");
            return;
        }

        this.contentArea = contentArea;
        contentArea.addEventListener("click", this.handleClick, true);
        contentArea.addEventListener("keydown", this.handleKeyDown, true);
    }

    teardown(): void {
        if (!this.contentArea) return;

        this.contentArea.removeEventListener("click", this.handleClick, true);
        this.contentArea.removeEventListener("keydown", this.handleKeyDown, true);
        this.contentArea = null;
    }

    private readonly handleClick = (event: MouseEvent) => {
        if (event.defaultPrevented) return;

        const target = event.target as Node | null;
        const equation = closestEquationElement(target);
        if (!equation) return;

        event.preventDefault();
        event.stopPropagation();

        this.focusEquation(equation);
        this.openPopover(equation);
    };

    private readonly handleKeyDown = (event: KeyboardEvent) => {
        if (event.defaultPrevented) return;
        if (event.key !== "Enter" && event.key !== " " && event.key !== "Spacebar") return;

        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        if (!isEquationElement(target)) return;

        event.preventDefault();
        event.stopPropagation();

        this.focusEquation(target);
        this.openPopover(target);
    };

    private focusEquation(equation: HTMLElement) {
        const doc = equation.ownerDocument ?? document;
        const selection = doc.getSelection?.() ?? globalThis.getSelection();
        if (!selection) return;

        const range = doc.createRange();
        range.selectNode(equation);

        selection.removeAllRanges();
        selection.addRange(range);
    }

    private openPopover(equation: HTMLElement) {
        if (!equation.hasAttribute("aria-label")) {
            equation.setAttribute("aria-label", t("equation"));
        }

        if (equation.getAttribute(EQUATION_DATA_ATTRIBUTE) !== "true") {
            equation.setAttribute(EQUATION_DATA_ATTRIBUTE, "true");
            equation.dataset.equation = "true";
        }

        runCommand("openEquationPopover", {
            content: {
                targetEquation: equation,
            },
        });
    }
}