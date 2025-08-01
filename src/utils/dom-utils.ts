

export function findClosestAncestorOfSelectionByClass(className: string): HTMLElement | null {
    const selection = window.getSelection();

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
        const selection = window.getSelection();

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
    if (!currentBlock) return;

    currentBlock.focus();

    const range = document.createRange();
    const selection = window.getSelection();

    const firstTextNode = getFirstTextNode(currentBlock);
    if (firstTextNode) {
        range.setStart(firstTextNode, 0);
    } else {
        range.setStart(currentBlock, 0);
    }

    range.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(range);

}

export function getFirstTextNode(element: HTMLElement): Text | null {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
            if (node.textContent?.trim().length) {
                return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_SKIP;
        }
    });

    return walker.nextNode() as Text | null;
}