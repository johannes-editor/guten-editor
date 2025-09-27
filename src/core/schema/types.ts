export type AttributeValueConstraint = readonly string[] | "*";

export interface AttributeRule {
  name: string;
  /**
   * Allowed values for the attribute. Use "*" to allow any value after
   * sanitization or provide an array with the allowed values.
   */
  values?: AttributeValueConstraint;
  /**
   * Called before validation. Return `null` to remove the attribute.
   */
  sanitize?: (value: string) => string | null;
}

export interface ClassRule {
  /**
   * Defines which classes are allowed on the element. When omitted the rule
   * will allow any class name. Use an empty array to disallow all classes.
   */
  allowed?: readonly string[];
  /**
   * When `true` additional classes can be provided besides the allowed list.
   */
  allowAdditional?: boolean;
}

export interface ChildRule {
  /** Allowed tag names (lowercase) for this child rule. */
  tags: readonly string[];
  /**
   * Optional override for class and attribute rules on this child. When
   * omitted the child's own schema rule is used.
   */
  classes?: ClassRule;
  attributes?: readonly AttributeRule[];
  /**
   * Allow text nodes inside this child definition. Defaults to `false`.
   */
  allowText?: boolean;
}

export interface SchemaRule {
  tag: string;
  allowedChildren?: readonly ChildRule[];
  allowedAttributes?: readonly AttributeRule[];
  classes?: ClassRule;
  /**
   * Validation hook that can mutate the element or throw to signal invalid
   * structure. Keep the hook side-effect free for unrelated nodes.
   */
  validate?: (element: HTMLElement, context: SchemaValidationContext) => void;
  /**
   * Normalisation hook executed after validation to ensure consistent DOM
   * (placeholder text, extra wrappers, etc.).
   */
  normalize?: (element: HTMLElement, context: SchemaValidationContext) => void;
}

export interface VariantSchema {
  variant: string;
  rule: SchemaRule;
}

export interface SchemaValidationContext {
  readonly registry: SchemaRegistry;
}

export interface SchemaRegistry {
  getRule(tagName: string): SchemaRule | undefined;
  isAllowedInRoot(tagName: string): boolean;
}
