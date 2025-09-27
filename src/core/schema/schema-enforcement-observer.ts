import { getFallbackFor } from "./fallback-registry.ts";
import { ensurePlaceholder } from "./placeholders.ts";
import { sanitizeElement } from "./sanitizers.ts";
import { schemaRegistry } from "./registry.ts";
import type { SchemaRule, ChildRule, AttributeRule, ClassRule } from "./types.ts";

export interface SchemaEnforcementOptions {
  registry?: typeof schemaRegistry;
}

export class SchemaEnforcementObserver {
  private observer: MutationObserver | null = null;
  private readonly registry = this.options.registry ?? schemaRegistry;

  constructor(private readonly root: HTMLElement, private readonly options: SchemaEnforcementOptions = {}) {}

  enforce(element: HTMLElement, { isRootChild = false }: { isRootChild?: boolean } = {}): HTMLElement {
    return this.processElement(element, isRootChild);
  }

  start(): void {
    this.stop();

    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          for (const node of Array.from(mutation.addedNodes)) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              const isRootChild = element.parentElement === this.root;
              this.processElement(element, isRootChild);
            }
          }
        }
      }
    });

    this.observer.observe(this.root, { childList: true, subtree: true });
  }

  stop(): void {
    this.observer?.disconnect();
    this.observer = null;
  }

  private processElement(element: HTMLElement, isRootChild = false): HTMLElement {
    const fallback = getFallbackFor(element);
    if (fallback && element !== fallback) {
      element.replaceWith(fallback);
      element = fallback;
    }

    sanitizeElement(element);

    const rule = this.registry.getRule(element.tagName);
    if (!rule) {
      return isRootChild ? this.replaceWithParagraph(element) : element;
    }

    this.applyClassRule(element, rule.classes);
    this.applyAttributeRules(element, rule.allowedAttributes);
    this.validateChildren(element, rule);

    rule.validate?.(element, { registry: this.registry });
    rule.normalize?.(element, { registry: this.registry });

    if (isRootChild && !this.registry.isAllowedInRoot(rule.tag)) {
      return this.replaceWithParagraph(element);
    }
    return element;
  }

  private validateChildren(element: HTMLElement, rule: SchemaRule): void {
    if (!rule.allowedChildren || rule.allowedChildren.length === 0) {
      return;
    }

    const allowed = flattenChildRules(rule.allowedChildren);
    const childNodes = Array.from(element.childNodes);

    for (const node of childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent ?? "";
        if (!text.trim() && !allowed.hasText) {
          element.removeChild(node);
        }
        continue;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const child = node as HTMLElement;
        const tag = child.tagName.toLowerCase();
        if (!allowed.tags.has(tag)) {
          const fallback = getFallbackFor(child) ?? this.createParagraphElement();
          child.replaceWith(fallback);
          this.processElement(fallback);
          continue;
        }

        const overrideRule = allowed.perChild.get(tag);
        if (overrideRule) {
          this.applyClassRule(child, overrideRule.classes);
          this.applyAttributeRules(child, overrideRule.attributes);
        }

        this.processElement(child);
      }
    }
  }

  private applyClassRule(element: HTMLElement, rule?: ClassRule): void {
    if (!rule) return;
    const allowed = new Set(rule.allowed ?? []);
    for (const className of Array.from(element.classList)) {
      if (!allowed.has(className) && !rule.allowAdditional) {
        element.classList.remove(className);
      }
    }
    for (const className of allowed) {
      if (!element.classList.contains(className)) {
        element.classList.add(className);
      }
    }
  }

  private applyAttributeRules(element: HTMLElement, rules?: readonly AttributeRule[]): void {
    if (!rules) return;

    const allowedNames = new Set(rules.map((rule) => rule.name));
    for (const attr of Array.from(element.attributes)) {
      if (!allowedNames.has(attr.name)) {
        element.removeAttribute(attr.name);
        continue;
      }

      const rule = rules.find((candidate) => candidate.name === attr.name);
      if (!rule) continue;
      const sanitized = rule.sanitize?.(attr.value) ?? attr.value;
      if (sanitized === null) {
        element.removeAttribute(attr.name);
        continue;
      }
      if (rule.values && rule.values !== "*" && !rule.values.includes(sanitized)) {
        element.removeAttribute(attr.name);
        continue;
      }
      if (sanitized !== attr.value) {
        element.setAttribute(attr.name, sanitized);
      }
    }
  }

  private replaceWithParagraph(element: HTMLElement): HTMLElement {
    const paragraph = this.createParagraphElement();
    element.replaceWith(paragraph);
    ensurePlaceholder(paragraph);
    return paragraph;
  }

  private createParagraphElement(): HTMLElement {
    const paragraph = document.createElement("p");
    paragraph.classList.add("block", "placeholder");
    ensurePlaceholder(paragraph);
    return paragraph;
  }
}

interface FlattenedChildRule {
  tags: Set<string>;
  hasText: boolean;
  perChild: Map<string, { classes?: ClassRule; attributes?: readonly AttributeRule[] }>;
}

function flattenChildRules(rules: readonly ChildRule[]): FlattenedChildRule {
  const tags = new Set<string>();
  const perChild = new Map<string, { classes?: ClassRule; attributes?: readonly AttributeRule[] }>();
  let hasText = false;

  for (const rule of rules) {
    for (const tag of rule.tags) {
      const lower = tag.toLowerCase();
      tags.add(lower);
      if (rule.classes || rule.attributes) {
        perChild.set(lower, { classes: rule.classes, attributes: rule.attributes });
      }
    }
    hasText = hasText || Boolean(rule.allowText);
  }

  return { tags, hasText, perChild };
}
