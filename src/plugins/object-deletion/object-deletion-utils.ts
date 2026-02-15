import { focusStartOfBlock } from "@utils/dom/block";

export const FOCUSABLE_OBJECT_SELECTOR = [
    "[data-image-placeholder='true']",
    "figure.image-block[data-image-embed='true']",
    ".mosaic-block__tile[data-mosaic-tile]",
    "[data-youtube-placeholder='true']",
    ".youtube-embed[data-youtube-embed='true']",
].join(",");

const BLOCK_SELECTOR = ".block";

export function findFocusableObjectFromNode(node: Node | null): HTMLElement | null {
    if (!(node instanceof HTMLElement)) return null;
    return node.closest<HTMLElement>(FOCUSABLE_OBJECT_SELECTOR);
}

export function decorateFocusableObjects(root: ParentNode): void {
    const objects = new Set<HTMLElement>(Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_OBJECT_SELECTOR)));
    if (root instanceof HTMLElement && root.matches(FOCUSABLE_OBJECT_SELECTOR)) {
        objects.add(root);
    }

    for (const element of Array.from(objects)) {
        element.dataset.gutenObjectFocusable = "true";
        element.classList.add("guten-focusable-object");
        if (element.tabIndex < 0) element.tabIndex = 0;
    }

    const ignored = new Set<HTMLElement>(Array.from(root.querySelectorAll<HTMLElement>(".mosaic-block__add-tile")));
    if (root instanceof HTMLElement && root.matches(".mosaic-block__add-tile")) {
        ignored.add(root);
    }

    for (const element of Array.from(ignored)) {
        element.dataset.gutenObjectDeleteIgnore = "true";
    }
}

export function clearFocusedObject(root?: ParentNode): void {
    const scope = root ?? document;
    const active = scope.querySelector<HTMLElement>(".guten-focused-object");
    active?.classList.remove("guten-focused-object");
}

export function setFocusedObject(target: HTMLElement): void {
    clearFocusedObject(document);
    target.classList.add("guten-focused-object");
    target.focus({ preventScroll: true });
}

export function getFocusedObject(root?: ParentNode): HTMLElement | null {
    const scope = root ?? document;
    return scope.querySelector<HTMLElement>(".guten-focused-object[data-guten-object-focusable='true']");
}

export function focusBlockElement(block: HTMLElement): void {
    const selection = block.ownerDocument?.getSelection?.() ?? globalThis.getSelection();
    if (!selection) return;

    const range = block.ownerDocument?.createRange?.() ?? document.createRange();
    range.selectNode(block);
    selection.removeAllRanges();
    selection.addRange(range);
}

function nodeHasRenderableContent(node: Node): boolean {
    if (node.nodeType === Node.TEXT_NODE) {
        return (node.textContent ?? "").trim().length > 0;
    }

    if (!(node instanceof HTMLElement)) return false;

    if (node.dataset.gutenObjectDeleteIgnore === "true") return false;
    if (node.dataset.gutenObjectFocusable === "true") return true;

    const tag = node.tagName;
    if (tag === "BR" || tag === "STYLE") return false;
    if (tag === "IMG" || tag === "IFRAME" || tag === "VIDEO" || tag === "TABLE" || tag === "HR") return true;

    for (const child of Array.from(node.childNodes)) {
        if (nodeHasRenderableContent(child)) return true;
    }

    return false;
}

export function isBlockEmpty(block: HTMLElement): boolean {
    for (const child of Array.from(block.childNodes)) {
        if (nodeHasRenderableContent(child)) return false;
    }

    return true;
}

export function removeObjectAndCleanupBlock(target: HTMLElement): boolean {
    const block = target.closest<HTMLElement>(BLOCK_SELECTOR);
    target.remove();

    if (!block) return true;
    if (!isBlockEmpty(block)) return true;

    const fallback = block.previousElementSibling as HTMLElement | null
        ?? block.nextElementSibling as HTMLElement | null;

    block.remove();

    if (fallback?.classList.contains("block")) {
        focusStartOfBlock(fallback);
    }

    return true;
}