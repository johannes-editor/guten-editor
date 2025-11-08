export const EQUATION_DATA_ATTRIBUTE = "data-equation";
export const EQUATION_SELECTOR = `[${EQUATION_DATA_ATTRIBUTE}="true"]`;

export interface EquationElementOptions {
    latex: string;
    html: string;
    displayMode: boolean;
    doc?: Document;
    ariaLabel?: string;
}

export function createEquationElement(options: EquationElementOptions): HTMLElement {
    const { latex, html, displayMode, ariaLabel } = options;
    const doc = options.doc ?? document;

    const element = doc.createElement(displayMode ? "div" : "span");
    element.className = displayMode ? "math-block" : "math-inline";
    element.setAttribute("data-latex", latex);
    element.setAttribute("contenteditable", "false");
    element.setAttribute("data-display-mode", displayMode ? "block" : "inline");
    element.setAttribute(EQUATION_DATA_ATTRIBUTE, "true");
    element.setAttribute("role", "button");
    element.tabIndex = 0;
    element.innerHTML = html;
    element.dataset.latex = latex;
    element.dataset.displayMode = displayMode ? "block" : "inline";
    element.dataset.equation = "true";

    if (ariaLabel) {
        element.setAttribute("aria-label", ariaLabel);
    }

    return element;
}

export function isEquationElement(element: Element | null | undefined): element is HTMLElement {
    if (!(element instanceof HTMLElement)) return false;

    if (element.getAttribute(EQUATION_DATA_ATTRIBUTE) === "true") return true;
    if (element.hasAttribute("data-latex")) return true;
    if (element.tagName.toLowerCase() === "guten-inline-equation") return true;

    return false;
}

export function closestEquationElement(node: Node | null | undefined): HTMLElement | null {
    if (!node) return null;

    let current: Element | null;
    if (node instanceof Element) {
        current = node;
    } else {
        current = node.parentElement;
    }

    while (current) {
        if (isEquationElement(current)) {
            return current as HTMLElement;
        }
        current = current.parentElement;
    }

    return null;
}