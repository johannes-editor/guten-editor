export function getCurrentSelectionRange(): Range | null {
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

export function hasSelection(
    container: HTMLElement = document.getElementById('contentArea')!
): boolean {
    if (!container) return false;

    const root = container.getRootNode() as Document | ShadowRoot;
    const getSel = (root as any).getSelection?.bind(root) ?? document.getSelection.bind(document);
    const sel: Selection | null = getSel();

    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
        const hasLockedSelection = Boolean((globalThis as any).CSS?.highlights?.has?.("persist"));
        return hasLockedSelection;
    }

    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false;
    if (!container.contains(sel.anchorNode) || !container.contains(sel.focusNode)) return false;

    const text = sel.toString().replace(/[\s\u00A0\u200B]+/g, '');
    if (text.length > 0) return true;

    const range = sel.getRangeAt(0);
    const walker = document.createTreeWalker(
        range.commonAncestorContainer,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode(node: Node) {
                if (!container.contains(node)) return NodeFilter.FILTER_REJECT;
                const r = document.createRange();
                r.selectNodeContents(node);
                const intersects =
                    range.compareBoundaryPoints(Range.END_TO_START, r) < 0 &&
                    range.compareBoundaryPoints(Range.START_TO_END, r) > 0;
                const hasRealText = /\S/.test((node.nodeValue || '').replace(/[\u00A0\u200B]/g, ''));
                return intersects && hasRealText ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
            }
        } as any
    );
    return !!walker.nextNode();
}

export function clearSelection(): void {
    const sel = globalThis.getSelection();

    if (sel) {
        sel.removeAllRanges();
    }
}

export function findClosestBlockBySelection(sel: Selection | null = null): HTMLElement | null {
    const selection = sel ?? globalThis.getSelection?.() ?? null;

    let node: Node | null = null;
    if (selection && selection.rangeCount > 0) {
        node = selection.focusNode || selection.anchorNode || selection.getRangeAt(0).startContainer;
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

const CARET_ANCHOR_DATASET_KEY = "gutenCaretAnchor";

export function createAnchorAtSelection(): HTMLElement | null {
    const selectionRange = getCurrentSelectionRange();
    if (!selectionRange) return null;

    const anchor = document.createElement("span");
    anchor.dataset[CARET_ANCHOR_DATASET_KEY] = "true";
    anchor.textContent = "\u200b";
    anchor.style.display = "inline-block";
    anchor.style.position = "absolute";
    anchor.style.width = "0";
    anchor.style.height = "0";
    anchor.style.padding = "0";
    anchor.style.margin = "0";
    anchor.style.lineHeight = "0";

    selectionRange.insertNode(anchor);
    selectionRange.setStartAfter(anchor);
    selectionRange.setEndAfter(anchor);

    const selection = globalThis.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(selectionRange);

    return anchor;
}

export function restoreSelectionToAnchor(anchor: HTMLElement | null): void {
    if (!anchor || !anchor.isConnected) return;

    const block = anchor.closest(".block") as HTMLElement | null;
    block?.focus();

    const range = document.createRange();
    range.setStartAfter(anchor);
    range.collapse(true);

    const selection = globalThis.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
}

export function cleanupCaretAnchor(anchor: HTMLElement | null): void {
    if (!anchor?.dataset?.[CARET_ANCHOR_DATASET_KEY]) return;
    restoreSelectionToAnchor(anchor);
    anchor.remove();
}
