//TODO: This file is a bit of a catch-all for various DOM-related utilities. It might be worth splitting it into multiple files in the future (e.g., selection-utils.ts, block-utils.ts, etc.) to improve organization and maintainability.


export function findClosestAncestorOfSelectionByClass(className: string): HTMLElement | null {
    const selection = globalThis.getSelection();

    if (!selection || selection.rangeCount === 0) {
        return null;
    }

    let currentElement: Node | null = selection.getRangeAt(0).commonAncestorContainer;

    if (currentElement && currentElement.nodeType === Node.TEXT_NODE) {
        currentElement = currentElement.parentNode;
    }

    while (currentElement) {
        if (currentElement.nodeType === Node.ELEMENT_NODE && (currentElement as HTMLElement).classList.contains(className)) {
            return currentElement as HTMLElement;
        }
        currentElement = currentElement.parentNode;
    }

    return null;
}

export function insertBlockAfter(block: HTMLElement | null, newHTML: string) {
    const contentNode = document.getElementById("content")!;

    if (block) {

        block.insertAdjacentHTML("afterend", newHTML);
    } else {
        contentNode.insertAdjacentHTML("beforeend", newHTML);
    }
}

export function focusNextBlock(currentBlock: HTMLElement | null) {
    if (!currentBlock) return;

    const next = currentBlock.nextElementSibling as HTMLElement | null;

    if (next && next.classList.contains("block")) {
        next.focus();

        const range = document.createRange();
        const selection = globalThis.getSelection();

        const firstTextNode = getFirstTextNode(next);
        if (firstTextNode) {
            range.setStart(firstTextNode, 0);
        } else {
            range.setStart(next, 0);
        }

        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
    }
}

export function focusOnElement(currentBlock: HTMLElement | null) {
    focusOnElementWithCaretPosition(currentBlock, "smart");
}

export function focusOnElementAtStart(currentBlock: HTMLElement | null) {
    focusOnElementWithCaretPosition(currentBlock, "start");
}

function focusOnElementWithCaretPosition(currentBlock: HTMLElement | null, position: "start" | "smart") {
    if (!currentBlock) return;

    const selection = globalThis.getSelection();
    currentBlock.focus();

    if (position === "smart" && selection?.rangeCount) {
        const currentRange = selection.getRangeAt(0);

        if (
            currentBlock.contains(currentRange.startContainer) &&
            hasCollapsedEditableCaret(currentRange, currentBlock)
        ) {
            return;
        }
    }

    const range = document.createRange();

    const firstTextNode = getFirstTextNode(currentBlock);
    if (firstTextNode) {
        range.setStart(firstTextNode, 0);
    } else {
        const offset = position === "start" ? 0 : currentBlock.childNodes.length;
        range.setStart(currentBlock, offset);
    }

    range.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(range);
}

export function getFirstTextNode(element: HTMLElement): Text | null {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
            if (!node.textContent?.trim().length) {
                return NodeFilter.FILTER_SKIP;
            }

            if (!isEditableNode(node)) {
                return NodeFilter.FILTER_SKIP;
            }

            return NodeFilter.FILTER_ACCEPT;
        }
    });

    return walker.nextNode() as Text | null;
}

function isEditableNode(node: Node): boolean {
    let current: Node | null = node;

    while (current) {
        if (current instanceof HTMLElement) {
            const editable = current.getAttribute("contenteditable");

            if (editable === "false") {
                return false;
            }
        }

        current = current.parentNode;
    }

    return true;
}


function hasCollapsedEditableCaret(range: Range, root: HTMLElement): boolean {
    if (!range.collapsed) {
        return false;
    }

    if (!root.contains(range.startContainer)) {
        return false;
    }

    const container = range.startContainer;

    if (container.nodeType === Node.TEXT_NODE) {
        return isEditableNode(container);
    }

    if (container.nodeType === Node.ELEMENT_NODE) {
        if (!isEditableNode(container)) {
            return false;
        }

        const element = container as Element;
        const childAfter = element.childNodes.item(range.startOffset);

        if (childAfter && !isEditableNode(childAfter)) {
            return false;
        }

        return true;
    }

    return false;
}