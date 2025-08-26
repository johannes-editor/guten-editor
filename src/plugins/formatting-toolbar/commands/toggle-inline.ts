import { CommandContext } from "../../../core/command/command.ts";

/**
 * Toggle an inline element around the current selection.
 * Falls back silently if selection is invalid or cannot be wrapped.
 */
export function toggleInlineTag(tag: string, context?: CommandContext): boolean {
  const selection = context?.selection || window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;

  const range = selection.getRangeAt(0);
  if (range.collapsed) return false;

  // If selection already inside the tag, unwrap it
  let container: Node | null = range.commonAncestorContainer;
  while (container && container.nodeType !== 1) {
    container = container.parentNode;
  }
  if (container instanceof Element) {
    const existing = container.closest(tag);
    if (existing) {
      const parent = existing.parentNode;
      if (parent) {
        while (existing.firstChild) parent.insertBefore(existing.firstChild, existing);
        existing.remove();
        context?.root?.dispatchEvent(new Event("input", { bubbles: true }));
        return true;
      }
    }
  }

  const el = document.createElement(tag);
  try {
    range.surroundContents(el);
  } catch {
    return false;
  }
  context?.root?.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
}
