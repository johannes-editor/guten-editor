import { ExtensiblePlugin } from "./extensible-plugin.ts";
import { PluginExtension } from "./plugin-extension.ts";
import { Plugin } from "./plugin.ts";
import type { PluginEntry, PluginManifest } from "./types.ts";

const manifests = import.meta.glob(
    "../../plugins/*/manifest.json",
    { eager: true },
) as unknown as Record<string, { default: PluginManifest }>;

const pluginModules = import.meta.glob(
    ["../../plugins/**/*.{ts,tsx}", "!../../plugins/**/*.test.{ts,tsx}"],
    { eager: true },
) as unknown as Record<string, Record<string, unknown>>;


export class PluginManager {
    init(root: HTMLElement): void {
        const plugins = this.fetchPlugins();

        for (const plugin of plugins) {
            plugin.setup(root, plugins);
        }

        for (const plugin of plugins) {
            if (plugin instanceof ExtensiblePlugin) {
                const extensions = plugin.findExtensions(plugins);
                plugin.attachExtensions(extensions);
            }
        }

        for (const plugin of plugins) {
            if (plugin instanceof PluginExtension) {

                const ParentCtor = plugin.target as unknown as new () => Plugin;
                const parent = plugins.find((p) => p instanceof ParentCtor);

                if (!parent) {
                    console.warn(
                        `[PluginExtension] Parent plugin not found for ${plugin.constructor.name} (target: ${(ParentCtor as any)?.name ?? "unknown"}). The extension will be skipped.`
                    );
                    continue;
                }

                plugin.setupExtension(parent);
            }
        }
    }

    private fetchPlugins(): Plugin[] {
        const loaded: Plugin[] = [];

        for (const manifestPath in manifests) {
            const manifest = manifests[manifestPath].default;

            if (!Array.isArray(manifest.entries)) {
                console.warn(`Manifest ${manifestPath} missing or invalid "entries" array`);
                continue;
            }

            const baseDir = manifestPath.replace("/manifest.json", "");

            for (const entry of manifest.entries) {
                if (!this.isValidEntry(entry, manifestPath)) continue;
                if (!entry.active) continue;

                const sourceKey = `${baseDir}/${entry.path.replace(/^\.?\//, "")}`;
                const mod = pluginModules[sourceKey];

                if (!mod) {
                    console.warn(`Source file not found or not bundled: ${sourceKey}`);
                    continue;
                }

                try {
                    // deno-lint-ignore no-explicit-any
                    const PluginClass = (mod as any)[entry.class] as { new(): Plugin };

                    if (!PluginClass) {
                        console.warn(`Class "${entry.class}" not exported by ${sourceKey}.`);
                        continue;
                    }

                    const instance = new PluginClass();
                    if (instance instanceof Plugin) loaded.push(instance);
                } catch (err) {
                    console.warn(
                        `Failed to load plugin at ${sourceKey}: ${err instanceof Error ? err.message : err}`,
                    );
                }
            }
        }

        return loaded;
    }

    // deno-lint-ignore no-explicit-any
    private isValidEntry(entry: any, path: string): entry is PluginEntry {
        const required = ["path", "class", "active"];
        for (const field of required) {
            if (!(field in entry)) {
                console.warn(`Manifest entry in ${path} missing required field "${field}"`);
                return false;
            }
        }
        return true;
    }
}