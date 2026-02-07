import { ExtensiblePlugin, PluginExtension } from "@core/plugin-engine/index.ts";
import { AssetBundle, loadAssetsSequentially } from "@core/asset-loader/index.ts";

/**
 * Plugin that registers and loads external CSS/JS assets declared by extensions.
 * - Deduplicates loads per feature and per asset.
 * - Resolves dependencies depth-first.
 * - Supports eager strategies: "startup" and "idle".
 */
export class ExternalAssetsPlugin extends ExtensiblePlugin<ExternalAssetsExtensionPlugin> {

    /** All declared bundles by feature key. */
    private registry = new Map<string, AssetBundle>();

    /** In-flight load promises by feature key (coalesces concurrent requests). */
    private inFlight = new Map<string, Promise<void>>();

    /** Completed features (fully loaded, including deps). */
    private done = new Set<string>();

    /**
    * Collects bundles from extensions and triggers eager loading.
    * @param exts Extensions that declare asset bundles.
    */
    override attachExtensions(exts: ExternalAssetsExtensionPlugin[]): void {

        for (const ext of exts) {
            const bundles = ext.bundles();
            const list: AssetBundle[] = Array.isArray(bundles) ? bundles
                : [bundles];

            for (const b of list) this.registry.set(b.feature, b);
        }

        // Eager load "startup" immediately, "idle" on next idle tick.
        for (const b of this.registry.values()) {
            if (b.when === "startup") {
                this.ensure(b.feature);
            } else if (b.when === "idle") {
                const idle = (globalThis as any).requestIdleCallback ?? ((cb: any) => setTimeout(cb, 1));
                idle(() => this.ensure(b.feature));
            }
        }
    }

    /**
    * Ensures a feature (and its dependencies) is loaded exactly once.
    * @param feature Feature key (e.g., "katex").
    * @returns Promise that resolves when the feature’s assets are available.
    */
    private ensure(feature: string): Promise<void> {
        if (this.done.has(feature)) return Promise.resolve();
        const inflight = this.inFlight.get(feature);
        if (inflight) return inflight;

        const b = this.registry.get(feature);
        if (!b) return Promise.reject(new Error(`Assets feature not registered: ${feature}`));

        const p = Promise.all((b.dependsOn ?? []).map((d) => this.ensure(d)))
            .then(() => loadAssetsSequentially(b.assets))
            .then(() => { this.done.add(feature); this.inFlight.delete(feature); });

        this.inFlight.set(feature, p);
        return p;
    }
}

/**
 * Base class for extensions that contribute external asset bundles.
 * Implement {@link bundles} to declare one or more {@link AssetBundle}s.
 */
export abstract class ExternalAssetsExtensionPlugin extends PluginExtension<ExternalAssetsPlugin> {

    override readonly target = ExternalAssetsPlugin;

    abstract bundles(): AssetBundle | AssetBundle[];
}
