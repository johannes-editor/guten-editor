import { createHeadingSchema, createParagraphSchema, createListItemSchema } from "./default-schema.ts";
import { schemaRegistry } from "./registry.ts";

let bootstrapped = false;

export function bootstrapDefaultSchema(): void {
  if (bootstrapped) return;
  bootstrapped = true;

  schemaRegistry.registerBlock("p", createParagraphSchema());
  schemaRegistry.registerBlock("h1", createHeadingSchema(1));
  schemaRegistry.registerBlock("h2", createHeadingSchema(2));
  schemaRegistry.registerBlock("h3", createHeadingSchema(3));
  schemaRegistry.registerBlock("h4", createHeadingSchema(4));
  schemaRegistry.registerBlock("h5", createHeadingSchema(5));
  schemaRegistry.registerBlock("h6", createHeadingSchema(6));
  schemaRegistry.registerBlock("li", createListItemSchema());

  schemaRegistry.allowInRoot("p", "h1", "h2", "h3", "h4", "h5", "h6");
}

export function resetSchemaRegistry(): void {
  bootstrapped = false;
  schemaRegistry.reset();
}
