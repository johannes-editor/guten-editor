/**
 * Returns true if the element is a text input area that should not be intercepted
 * by editor-level keybindings. Content-editable outside the editor root is ignored.
 */
function isTextInput(el?: Element | null): boolean {
    if (!el) return false;
    const tag = el.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return true;
    const editable = (el as HTMLElement).isContentEditable;
    // ignore se for um contenteditable fora do root (o listener está no root)
    return editable && !el.closest('[data-editor-root]');
}