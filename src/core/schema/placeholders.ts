const PLACEHOLDER_ATTRIBUTE = "data-placeholder";
const PLACEHOLDER_CLASS = "is-empty";

export interface PlaceholderOptions {
  placeholderText?: string;
}

export function ensurePlaceholder(element: HTMLElement, options: PlaceholderOptions = {}): void {
  const { placeholderText = "" } = options;
  if (!element.hasAttribute(PLACEHOLDER_ATTRIBUTE) && placeholderText) {
    element.setAttribute(PLACEHOLDER_ATTRIBUTE, placeholderText);
  }

  if (placeholderText && !element.classList.contains(PLACEHOLDER_CLASS)) {
    element.classList.add(PLACEHOLDER_CLASS);
  }

  if (!hasMeaningfulChildren(element)) {
    stripPlaceholderChildren(element);
    element.appendChild(document.createElement("br"));
  }
}

export function stripPlaceholderChildren(element: HTMLElement): void {
  const children = Array.from(element.childNodes);
  for (const node of children) {
    if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) {
      element.removeChild(node);
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.tagName.toLowerCase() === "br" && !el.dataset.persist) {
        element.removeChild(el);
      }
    }
  }
}

export function isMeaningfulContent(node: Node | null | undefined): boolean {
  if (!node) return false;
  if (node.nodeType === Node.TEXT_NODE) {
    return Boolean(node.textContent && node.textContent.trim().length > 0);
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement;
    if (element.tagName.toLowerCase() === "br") {
      return false;
    }

    return Array.from(element.childNodes).some(isMeaningfulContent);
  }

  return false;
}

function hasMeaningfulChildren(element: HTMLElement): boolean {
  return Array.from(element.childNodes).some(isMeaningfulContent);
}
