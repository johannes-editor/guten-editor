import { schemaRegistry } from "./registry.ts";
import type { SchemaRule, VariantSchema } from "./types.ts";

export function registerBlock(tag: string, rule: SchemaRule): void {
  schemaRegistry.registerBlock(tag, rule);
}

export function registerVariant(tag: string, variant: VariantSchema): void {
  schemaRegistry.registerVariant(tag, variant);
}

export function allowInRoot(...tags: string[]): void {
  schemaRegistry.allowInRoot(...tags);
}

export function getSchemaRegistry() {
  return schemaRegistry;
}

export type { SchemaRule, VariantSchema, AttributeRule, ChildRule, ClassRule } from "./types.ts";
export { SchemaEnforcementObserver } from "./schema-enforcement-observer.ts";
export { registerTagFallback, registerIntentFallback, getFallbackFor } from "./fallback-registry.ts";
export { bootstrapDefaultSchema } from "./bootstrap.ts";
