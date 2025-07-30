import { Plugin } from "./plugin.ts";
import { ExtensiblePlugin } from "./extensible-plugin.ts";

// deno-lint-ignore no-explicit-any
export abstract class PluginExtension<T extends ExtensiblePlugin<any>> extends Plugin {
    declare target: new () => T;

    override setup(_root: HTMLElement, _plugins: Plugin[]): void { }
}