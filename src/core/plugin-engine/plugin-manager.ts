import { Plugin } from "./plugin.ts";
import { PluginManifest } from "./types.ts";

const requiredPluginManifestFields = ["name", "path", "class", "active"] as const;

export class PluginManager {
    
    manifests = import.meta.glob("../../plugins/*/manifest.json");
    
    async init(root: HTMLElement) {
        const plugins = await this.fetchPlugins();
        for (const plugin of plugins) {
            try {
                plugin.setup(root, plugins);
            } catch (err) {
                console.error(
                    `Failed to setup plugin "${plugin.constructor.name}": ${err instanceof Error ? err.message : err}`,
                );
            }
        }
    }

    async fetchPlugins(): Promise<Plugin[]> {
        const plugins: Plugin[] = [];

        for (const manifestPath in this.manifests) {
            try {
                const manifestModule = await this.manifests[manifestPath]();
                const manifest = (manifestModule as any).default as PluginManifest;

                for (const field of requiredPluginManifestFields) {
                    if (!(field in manifest)) {
                        throw new Error(`Missing required field "${field}" in manifest at ${manifestPath}`);
                    }
                }

                if (!manifest.active) {
                    console.log(`Skipping inactive plugin: ${manifest.name}`);
                    continue;
                }

                const baseDir = manifestPath.replace("/manifest.json", "");
                const modulePath = `${baseDir}/${manifest.path.replace("./", "")}`;
                const mod = await import(/* @vite-ignore */ modulePath);
                const PluginClass = mod[manifest.class] as { new(): Plugin };

                if (!PluginClass) {
                    throw new Error(`Class ${manifest.class} not found in ${modulePath}`);
                }

                const instance = new PluginClass();
                if (instance instanceof Plugin) plugins.push(instance);

            } catch (err) {
                console.warn(`Failed to load plugin at ${manifestPath}: ${err instanceof Error ? err.message : err}`);
            }
        }

        return plugins;
    }
}