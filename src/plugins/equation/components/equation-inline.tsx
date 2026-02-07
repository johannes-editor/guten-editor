/** @jsx h */

import { t } from "@core/i18n/index.ts";
import { runCommand } from "@core/command/index.ts";
import { Component } from "@core/components/component.ts";
import { EventTypes } from "@utils/dom/index.ts";

export type EquationInlineProps = {
    latex: string;
    html: string;
    displayMode: boolean;
};

export class EquationInline extends Component<EquationInlineProps> {

    static override get tagName() {
        return "guten-inline-equation";
    }

    static override styles = /*css*/`

        guten-inline-equation{
            display: inline-flex;
            align-items: center;
            cursor: pointer;
        }

        :host {
            display: inline-flex;
            align-items: center;
            cursor: pointer;
        }

       guten-inline-equation([data-display-mode="block"]) {
            display: block;
        }

        guten-inline-equation(:focus-visible) {
            outline: 2px solid var(--focus-outline-color, rgba(66, 133, 244, 0.8));
            outline-offset: 2px;
        }
    `;

    override onMount(): void {
        this.setAttribute("contenteditable", "false");
        this.setAttribute("role", "button");
        this.setAttribute("aria-label", t("equation"));
        this.tabIndex = 0;

        this.registerEvent(this, EventTypes.Click, this.openPopover);
        this.registerEvent(this, EventTypes.KeyDown, this.handleKeydown as EventListener);

        this.syncAttributes();
    }

    override afterRender(): void {
        this.syncAttributes();
    }

    override render(): HTMLElement {
        const wrapper = document.createElement(this.props.displayMode ? "div" : "span");
        wrapper.className = this.props.displayMode ? "math-block" : "math-inline";
        wrapper.setAttribute("data-latex", this.props.latex);
        wrapper.setAttribute("contenteditable", "false");
        wrapper.innerHTML = this.props.html;
        return wrapper;
    }

    private readonly openPopover = (event?: Event) => {
        event?.preventDefault();
        event?.stopPropagation();

        this.focusEquation();
        runCommand("openEquationPopover", {
            content: {
                targetEquation: this,
                latex: this.props.latex,
                displayMode: this.props.displayMode,
            },
        });
    };

    private readonly handleKeydown = (event: KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            this.openPopover(event);
        }
    };

    private focusEquation(): void {
        const selection = globalThis.getSelection();
        if (!selection) return;

        const range = document.createRange();
        range.selectNode(this);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    private syncAttributes(): void {
        this.dataset.latex = this.props.latex;
        this.dataset.displayMode = this.props.displayMode ? "block" : "inline";
    }
}