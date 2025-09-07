export class SelectionUtils {
    static getCurrentSelectionRange(): Range | null {
        const getSelection = typeof globalThis.getSelection === "function"
            ? globalThis.getSelection
            : null;

        if (!getSelection) return null;

        const selection = getSelection();
        if (selection && selection.rangeCount > 0) {
            return selection.getRangeAt(0).cloneRange();
        }
        return null;
    }
}

export function hasSelection(): boolean {
    const selection = globalThis.getSelection();
    return (selection && selection.rangeCount > 0 && selection.toString().trim() !== "") ?? false;
}

export function clearSelection(): void {
    const sel = globalThis.getSelection();

    if (sel) {
        sel.removeAllRanges();
    }
}

export function findClosestBlockBySelection(): HTMLElement | null {
    const sel = globalThis.getSelection?.() || null;

    let node: Node | null = null;
    if (sel && sel.rangeCount > 0) {
        node = sel.focusNode || sel.anchorNode || sel.getRangeAt(0).startContainer;
    }

    let el: Element | null = null;
    if (node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            el = node as Element;
        } else if (node.nodeType === Node.TEXT_NODE) {
            el = (node as Text).parentElement;
        } else if (node instanceof ShadowRoot) {
            el = node.host;
        }
    }

    if (!el && globalThis.document?.activeElement) {
        el = globalThis.document.activeElement as Element;
    }

    while (el) {
        const match = el.closest?.('.block') as HTMLElement | null;
        if (match) return match;

        const root = el.getRootNode();
        if (root instanceof ShadowRoot && root.host) {
            el = root.host;
            continue;
        }

        break;
    }

    return null;
}
