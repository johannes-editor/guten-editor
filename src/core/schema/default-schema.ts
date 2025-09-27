import type { SchemaRule } from "./types.ts";
import { ensurePlaceholder } from "./placeholders.ts";

const INLINE_CHILDREN = [
  "a",
  "strong",
  "em",
  "code",
  "span",
  "br",
];

export function createParagraphSchema(): SchemaRule {
  return {
    tag: "p",
    classes: {
      allowed: ["block", "placeholder", "empty"],
      required: ["block", "placeholder"],
      allowAdditional: false,
    },
    allowedAttributes: [
      {
        name: "data-placeholder",
        values: "*",
      },
    ],
    allowedChildren: [
      {
        tags: INLINE_CHILDREN,
        allowText: true,
      },
    ],
    normalize(element) {
      ensurePlaceholder(element);
    },
  };
}

export function createHeadingSchema(level: 1 | 2 | 3 | 4 | 5 | 6): SchemaRule {
  return {
    tag: `h${level}`,
    classes: {
      allowed: ["block"],
      required: ["block"],
      allowAdditional: false,
    },
    allowedChildren: [
      {
        tags: INLINE_CHILDREN,
        allowText: true,
      },
    ],
    normalize(element) {
      ensurePlaceholder(element);
    },
  };
}

export function createListItemSchema(): SchemaRule {
  return {
    tag: "li",
    classes: {
      allowed: ["block"],
      allowAdditional: true,
    },
    allowedChildren: [
      {
        tags: ["p", ...INLINE_CHILDREN],
        allowText: true,
      },
    ],
    normalize(element) {
      ensurePlaceholder(element);
    },
  };
}
