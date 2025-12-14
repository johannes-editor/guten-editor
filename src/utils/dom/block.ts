import { InsertResultContext } from "../../core/command/types.ts";
import { focusOnElement } from "../dom-utils.ts";
import { selection } from "../index.ts";

const BLOCK_ID_PREFIX = "block-";

export function generateBlockId(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return `${BLOCK_ID_PREFIX}${crypto.randomUUID()}`;
    }

    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 10);
    return `${BLOCK_ID_PREFIX}${timestamp}${random}`;
}

export function ensureBlockId(element: HTMLElement, preferredId?: string): string {
    const existing = element.dataset.blockId;
    if (existing && existing.length > 0) {
        return existing;
    }

    const resolved = preferredId && preferredId.length > 0 ? preferredId : generateBlockId();
    element.dataset.blockId = resolved;
    return resolved;
}

export function applyTemporaryRing(target: HTMLElement, durationMs = 600) {
    void target.offsetWidth;
    target.classList.add('dup-block-ring');
    const t = setTimeout(() => target.classList.remove('dup-block-ring'), durationMs + 50);
    target.addEventListener('animationend', () => {
        clearTimeout(t);
        target.classList.remove('dup-block-ring');
    }, { once: true });
}

export function captureSelectionInBlock(block: HTMLElement): () => void {
    const active = document.activeElement as HTMLElement | null;
    if (active && block.contains(active)) {
        if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) {
            const start = active.selectionStart ?? 0;
            const end = active.selectionEnd ?? start;
            const dir = (active as any).selectionDirection as "forward" | "backward" | "none" | undefined;

            return () => {

                active.focus({ preventScroll: false });
                try {
                    active.setSelectionRange(start, end, dir || 'none');
                } catch {
                    // ignore
                }
            };
        }
    }

    const sel = globalThis.getSelection?.() || null;
    if (!sel || sel.rangeCount === 0) return () => { };

    const anchorNode = sel.anchorNode;
    const focusNode = sel.focusNode;
    if (!anchorNode || !focusNode) return () => { };

    const inside =
        block.contains(anchorNode) &&
        block.contains(focusNode);
    if (!inside) {
        return () => {
            const focusable = block.querySelector<HTMLElement>('[contenteditable="true"], input, textarea, [tabindex]:not([tabindex="-1"])');
            (focusable || block).focus?.({ preventScroll: false });
        };
    }

    const rTest = document.createRange();
    rTest.setStart(sel.anchorNode, sel.anchorOffset);
    rTest.setEnd(sel.focusNode, sel.focusOffset);
    const wasBackward = !sel.isCollapsed && rTest.collapsed;

    const mk = (name: string) => {
        const span = document.createElement('span');
        span.setAttribute('data-sel-marker', name);
        span.style.cssText = 'display:inline-block;width:0;height:0;overflow:hidden;line-height:0;';
        return span;
    };

    const anchorMarker = mk('anchor');
    const focusMarker = mk('focus');

    const a = document.createRange();
    a.setStart(sel.anchorNode, sel.anchorOffset); a.collapse(true);
    const f = document.createRange();
    f.setStart(sel.focusNode, sel.focusOffset); f.collapse(true);

    const laterFirst = a.compareBoundaryPoints(Range.START_TO_START, f) === 1
        ? 'anchor' : 'focus';

    const insertAt = (rng: Range, node: Node) => {
        rng.insertNode(node);
    };

    if (laterFirst === 'anchor') {
        insertAt(a, anchorMarker);
        insertAt(f, focusMarker);
    } else {
        insertAt(f, focusMarker);
        insertAt(a, anchorMarker);
    }

    return () => {
        const sel2 = globalThis.getSelection?.();
        if (!sel2) {
            anchorMarker.remove(); focusMarker.remove(); return;
        }

        const aParent = anchorMarker.parentNode as Node | null;
        const fParent = focusMarker.parentNode as Node | null;
        if (!aParent || !fParent) {
            anchorMarker.remove(); focusMarker.remove(); return;
        }

        const indexOf = (n: Node) => Array.prototype.indexOf.call(n.parentNode?.childNodes || [], n);

        const aContainer = aParent;
        const aOffset = indexOf(anchorMarker);
        const fContainer = fParent;
        const fOffset = indexOf(focusMarker);

        try {
            sel2.removeAllRanges();
            if (wasBackward) {
                sel2.setBaseAndExtent(fContainer, fOffset, aContainer, aOffset);
            } else {
                sel2.setBaseAndExtent(aContainer, aOffset, fContainer, fOffset);
            }
        } catch {
            const r = document.createRange();
            r.setStart(aContainer, aOffset);
            r.setEnd(fContainer, fOffset);
            sel2.removeAllRanges();
            sel2.addRange(r);
        } finally {
            anchorMarker.remove();
            focusMarker.remove();
        }

        const editable = block.querySelector<HTMLElement>('[contenteditable="true"]');
        editable?.focus?.({ preventScroll: false });
    };
}


export function getPrevBlockSibling(el: HTMLElement): HTMLElement | null {
    let cur = el.previousElementSibling as HTMLElement | null;
    while (cur && !cur.classList.contains('block')) {
        cur = cur.previousElementSibling as HTMLElement | null;
    }
    return cur;
}

export function getNextBlockSibling(el: HTMLElement): HTMLElement | null {
    let cur = el.nextElementSibling as HTMLElement | null;
    while (cur && !cur.classList.contains('block')) {
        cur = cur.nextElementSibling as HTMLElement | null;
    }
    return cur;
}

export function moveBlockUpPreservingCaret(block: HTMLElement): boolean {
    const parent = block.parentElement;
    if (!parent) return false;

    const prev = getPrevBlockSibling(block);
    if (!prev) return false;

    const restore = captureSelectionInBlock(block);
    parent.insertBefore(block, prev);
    restore();
    applyTemporaryRing(block, 600);
    return true;
}

export function moveBlockDownPreservingCaret(block: HTMLElement): boolean {
    const parent = block.parentElement;
    if (!parent) return false;

    const next = getNextBlockSibling(block);
    if (!next) return false;

    const restore = captureSelectionInBlock(block);
    parent.insertBefore(block, next.nextSibling);
    restore();
    applyTemporaryRing(block, 600);
    return true;
}

export function removeBlockWithTransition(block: HTMLElement, durationMs = 200): boolean {
    const parent = block.parentElement;
    if (!parent) return false;

    const startHeight = block.offsetHeight;

    block.classList.add("block-removing");
    block.style.boxSizing = "border-box";
    block.style.height = `${startHeight}px`;

    block.offsetHeight;

    block.style.opacity = "0";
    block.style.transform = "scale(0.98)";
    block.style.height = "0px";
    block.style.marginTop = "0px";
    block.style.marginBottom = "0px";
    block.style.paddingTop = "0px";
    block.style.paddingBottom = "0px";
    block.style.pointerEvents = "none";

    const cleanup = () => {
        block.remove();
    };

    let done = false;
    const onEnd = (e: TransitionEvent) => {
        if (done) return;

        if (e.propertyName === "height") {
            done = true;
            block.removeEventListener("transitionend", onEnd);
            cleanup();
        }
    };

    block.addEventListener("transitionend", onEnd);

    setTimeout(() => {
        if (done) return;
        done = true;
        block.removeEventListener("transitionend", onEnd);
        cleanup();
    }, durationMs + 80);

    return true;
}

export function focusStartOfBlock(block: HTMLElement) {

    const editable =
        (block.matches('[contenteditable="true"]') ? block : block.querySelector('[contenteditable="true"]')) as HTMLElement | null;

    if (editable) {
        editable.focus({ preventScroll: false });
        const sel = globalThis.getSelection?.();
        if (sel) {
            const r = document.createRange();

            const walker = document.createTreeWalker(editable, NodeFilter.SHOW_TEXT, null);
            const firstText = walker.nextNode();
            if (firstText) {
                r.setStart(firstText, 0);
            } else {
                r.selectNodeContents(editable);
                r.collapse(true);
            }
            r.collapse(true);
            sel.removeAllRanges();
            sel.addRange(r);
        }
        return;
    }

    const input = block.querySelector("input, textarea") as HTMLInputElement | HTMLTextAreaElement | null;
    if (input) {
        input.focus({ preventScroll: false });
        try {
            input.setSelectionRange(0, 0);
        } catch { /* ok */ }
        return;
    }

    block.focus?.({ preventScroll: false });
}

export function duplicateBlock(
    el: HTMLElement | null | undefined,
    opts: {
        insert?: 'after' | 'before';
        highlight?: boolean;
        highlightMs?: number;
        sanitizeIds?: boolean;
    } = {}
): HTMLElement | null {
    if (!el) return null;

    const {
        insert = 'after',
        highlight = true,
        highlightMs = 900,
        sanitizeIds = true,
    } = opts;

    const block = el.classList.contains('block') ? el : el.closest('.block') as HTMLElement | null;
    if (!block || !block.parentElement) return null;

    const clone = block.cloneNode(true) as HTMLElement;

    if (sanitizeIds) {
        clone.removeAttribute('id');
    }

    if (insert === 'after') {
        if (typeof (block as any).after === 'function') {
            (block as any).after(clone);
        } else {
            block.parentElement.insertBefore(clone, block.nextSibling);
        }
    } else {
        block.parentElement.insertBefore(clone, block);
    }

    if (highlight) applyTemporaryRing(clone, highlightMs);

    return clone;
}







export function findCodeAncestor(node: Node | null): HTMLElement | null {
    let current: Node | null = node;

    while (current) {
        if (current instanceof HTMLElement && current.tagName === "CODE") {
            return current;
        }

        if (current instanceof ShadowRoot) {
            current = current.host;
            continue;
        }

        current = current.parentNode;
    }

    return null;
}



export function applyInstructionText(target: HTMLElement | null, text: string | undefined) {
    if (!target || !text) return;
    target.textContent = text;
    target.classList.remove("empty", "placeholder");
    target.removeAttribute("data-placeholder");
}

export function getInstructionText(context?: InsertResultContext): string | undefined {
    const text = context?.instruction?.content ?? undefined;
    return text ? text : undefined;
}

export function resolveAfterBlock(context?: InsertResultContext): HTMLElement | null {
    if (context?.lastInsertedBlock) return context.lastInsertedBlock;
    if (context?.afterBlock) return context.afterBlock;
    return selection.findClosestBlockBySelection();
}


export function appendAfter(afterBlock: HTMLElement | null, element: HTMLElement): HTMLElement | null {
    if (afterBlock?.parentElement) {
        afterBlock.after(element);
        return element;
    }

    const contentArea = document.getElementById("contentArea");
    if (!contentArea) return null;
    contentArea.appendChild(element);
    return element;
}


export function focusIfNeeded(element: HTMLElement | null, context?: InsertResultContext) {
    if (!element) return;
    if (context?.focus === false) return;
    focusOnElement(element);
}

export function updateLastInserted(element: HTMLElement | null, context?: InsertResultContext) {
    if (context) context.lastInsertedBlock = element;
}