import type { SchemaRegistry as SchemaRegistryContract, SchemaRule, VariantSchema } from "./types.ts";

interface RegisteredVariant extends VariantSchema {
  tag: string;
}

export class SchemaRegistry implements SchemaRegistryContract {
  private readonly blocks = new Map<string, SchemaRule>();
  private readonly variants = new Map<string, RegisteredVariant>();
  private readonly rootAllowed = new Set<string>();

  registerBlock(tag: string, rule: SchemaRule): void {
    this.blocks.set(tag.toLowerCase(), { ...rule, tag: rule.tag ?? tag.toLowerCase() });
  }

  registerVariant(tag: string, variant: VariantSchema): void {
    const key = this.toVariantKey(tag, variant.variant);
    this.variants.set(key, { ...variant, tag: tag.toLowerCase() });
  }

  allowInRoot(...tags: string[]): void {
    for (const tag of tags) {
      this.rootAllowed.add(tag.toLowerCase());
    }
  }

  getRule(tagName: string): SchemaRule | undefined {
    return this.blocks.get(tagName.toLowerCase());
  }

  getVariant(tagName: string, variantName: string): SchemaRule | undefined {
    const key = this.toVariantKey(tagName, variantName);
    const variant = this.variants.get(key);
    return variant?.rule;
  }

  isAllowedInRoot(tagName: string): boolean {
    return this.rootAllowed.has(tagName.toLowerCase());
  }

  reset(): void {
    this.blocks.clear();
    this.variants.clear();
    this.rootAllowed.clear();
  }

  private toVariantKey(tag: string, variant: string): string {
    return `${tag.toLowerCase()}::${variant}`;
  }
}

export const schemaRegistry = new SchemaRegistry();
