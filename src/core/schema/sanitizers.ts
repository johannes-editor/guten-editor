const FORBIDDEN_ATTRIBUTES = new Set(["style", "onclick", "onmouseover"]);

export function sanitizeElement(element: HTMLElement): void {
  for (const attr of Array.from(element.attributes)) {
    if (FORBIDDEN_ATTRIBUTES.has(attr.name)) {
      element.removeAttribute(attr.name);
    }
  }

  unwrapRedundantSpans(element);
}

function unwrapRedundantSpans(element: HTMLElement): void {
  if (element.tagName.toLowerCase() === "span") {
    const childSpans = Array.from(element.children).every((child) => child.tagName === "SPAN");
    if (childSpans && !element.attributes.length) {
      const parent = element.parentElement;
      if (parent) {
        while (element.firstChild) {
          parent.insertBefore(element.firstChild, element);
        }
        parent.removeChild(element);
        return;
      }
    }
  }

  for (const child of Array.from(element.children)) {
    unwrapRedundantSpans(child as HTMLElement);
  }
}
