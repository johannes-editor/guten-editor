/// <reference lib="deno.ns" />
import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { toKebabCase } from "./utils.ts";

Deno.test("toKebabCase converts camelCase to kebab-case", () => {
  assertEquals(toKebabCase("CamelCase"), "camel-case");
  assertEquals(toKebabCase("helloWorld"), "hello-world");
  assertEquals(toKebabCase("already-kebab"), "already-kebab");
});