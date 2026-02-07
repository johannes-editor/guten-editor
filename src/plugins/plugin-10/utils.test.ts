// /// <reference lib="deno.ns" />
// import { assert, assertEquals } from "https://deno.land/std/assert/mod.ts";

// // Minimal DOM stubs for testing
// class TestHTMLElement {
//   tagName!: string;
//   innerHTML = "";
//   children: TestHTMLElement[] = [];
//   classList = { add() {} };
//   appendChild(child: TestHTMLElement) {
//     this.children.push(child);
//   }
//   setAttribute() {}
// }

// Deno.test("Plugin10 is instance of Plugin and appends button", async () => {
//   (globalThis as any).HTMLElement = TestHTMLElement;
//   (globalThis as any).document = {
//     createElement(tag: string) {
//       const el = new TestHTMLElement();
//       el.tagName = tag;
//       return el;
//     },
//   };
//   (globalThis as any).customElements = {
//     define() {},
//     get() { return undefined; },
//   };

//   const { Plugin10 } = await import("./plugin-10.tsx");
//   const { Button10 } = await import("./button-10.tsx");
//   const { Plugin } = await import("../../core/plugin-engine/plugin.ts");

//   assertEquals(Button10.getTagName(), "x-button10");

//   const plugin = new Plugin10();
//   const root = new TestHTMLElement();
//   plugin.setup(root as unknown as HTMLElement);
//   assert(plugin instanceof Plugin);
//   assertEquals(root.children.length, 1);
//   assertEquals(root.children[0].tagName, Button10.getTagName());
// });