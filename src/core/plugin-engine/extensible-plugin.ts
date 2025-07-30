import { Plugin } from "./plugin.ts";
import { PluginExtension } from "./plugin-extension.ts";

// deno-lint-ignore no-explicit-any
export abstract class ExtensiblePlugin<T extends PluginExtension<any>> extends Plugin {

    public findExtensions(plugins: Plugin[]): T[] {
        return plugins.filter(
            (p): p is T =>
                p instanceof PluginExtension &&
            p.target === this.constructor
        );
    }
    
    public abstract initialize(root: HTMLElement, extensions: T[]): void;
    override setup(_root: HTMLElement, _plugins: Plugin[]): void { }
}