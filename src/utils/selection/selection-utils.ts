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

// export function hasSelection(): boolean {
//     const selection = globalThis.getSelection();
//     return (selection && selection.rangeCount > 0 && selection.toString().trim() !== "") ?? false;
// }


export function hasSelection(
    container: HTMLElement = document.getElementById('contentArea')!
): boolean {
    if (!container) return false;

    const root = container.getRootNode() as Document | ShadowRoot;
    const getSel = (root as any).getSelection?.bind(root) ?? document.getSelection.bind(document);
    const sel: Selection | null = getSel();

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
