import { Plugin } from "./plugin.ts";
import type { PluginManifest } from "./types.ts";

const REQUIRED_FIELDS = ["name", "path", "class", "active"] as const;

const manifests = import.meta.glob(
  "../../plugins/*/manifest.json",
  { eager: true },
) as unknown as Record<string, { default: PluginManifest }>;

const pluginModules = import.meta.glob(
  "../../plugins/*/*.{ts,tsx}",
) as unknown as Record<string, () => Promise<Record<string, unknown>>>;

export class PluginManager {
  async init(root: HTMLElement): Promise<void> {
    const plugins = await this.fetchPlugins();

    for (const plugin of plugins) {
      try {
        plugin.setup(root, plugins);
      } catch (err) {
        console.error(
          `Failed to setup "${plugin.constructor.name}": ${
            err instanceof Error ? err.message : err
          }`,
        );
      }
    }
  }

  
  private async fetchPlugins(): Promise<Plugin[]> {
    const loaded: Plugin[] = [];

    for (const manifestPath in manifests) {
      const manifest = manifests[manifestPath].default;

      if (!this.isValidManifest(manifest, manifestPath)) continue;
      if (!manifest.active) continue;
      const baseDir   = manifestPath.replace("/manifest.json", "");
      const sourceKey = `${baseDir}/${manifest.path.replace(/^\.?\//, "")}`;

      const loader = pluginModules[sourceKey];
      if (!loader) {
        console.warn(`Source file not found or not bundled: ${sourceKey}`);
        continue;
      }

      try {
        const mod         = await loader();
        const PluginClass = (mod as any)[manifest.class] as { new (): Plugin };

        if (!PluginClass) {
          console.warn(
            `Class "${manifest.class}" not exported by ${sourceKey}.`,
          );
          continue;
        }

        const instance = new PluginClass();
        if (instance instanceof Plugin) loaded.push(instance);
      } catch (err) {
        console.warn(
          `Failed to load plugin at ${sourceKey}: ${
            err instanceof Error ? err.message : err
          }`,
        );
      }
    }
    return loaded;
  }

  
  private isValidManifest(
    manifest: PluginManifest,
    path: string,
  ): manifest is PluginManifest {
    for (const field of REQUIRED_FIELDS) {
      if (!(field in manifest)) {
        console.warn(`Manifest ${path} missing required field "${field}"`);
        return false;
      }
    }
    return true;
  }
}