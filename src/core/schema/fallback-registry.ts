import { ensurePlaceholder } from "./placeholders.ts";

export type TagFallbackFactory = (source: Element) => HTMLElement;
export type IntentPredicate = (element: Element) => boolean;

interface IntentFallback {
  predicate: IntentPredicate;
  factory: TagFallbackFactory;
  priority: number;
}

const tagFallbacks = new Map<string, TagFallbackFactory>();
const intentFallbacks: IntentFallback[] = [];

export function registerTagFallback(tagName: string, factory: TagFallbackFactory): void {
  tagFallbacks.set(tagName.toLowerCase(), factory);
}

export function registerIntentFallback(
  predicate: IntentPredicate,
  factory: TagFallbackFactory,
  priority = 0,
): void {
  intentFallbacks.push({ predicate, factory, priority });
  intentFallbacks.sort((a, b) => b.priority - a.priority);
}

export function getFallbackFor(element: Element): HTMLElement | null {
  const direct = tagFallbacks.get(element.tagName.toLowerCase());
  if (direct) {
    const replacement = direct(element);
    ensurePlaceholder(replacement);
    return replacement;
  }

  for (const handler of intentFallbacks) {
    if (handler.predicate(element)) {
      const replacement = handler.factory(element);
      ensurePlaceholder(replacement);
      return replacement;
    }
  }

  return null;
}

export function resetFallbackRegistry(): void {
  tagFallbacks.clear();
  intentFallbacks.length = 0;
}
