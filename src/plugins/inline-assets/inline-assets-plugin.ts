import { ExtensiblePlugin, PluginExtension } from "@core/plugin-engine/index.ts";
import { WhenToLoad } from "@core/asset-loader/types.ts";

type InlineAssetTarget = "head" | "body" | "root";

type InlineContentSource = string | (() => string | Promise<string>);
type ModuleValue<T> = T | { default: T };
type ModuleLoader<T> = () => ModuleValue<T> | Promise<ModuleValue<T>>;

export type InlineStyleAsset = {
    /** Optional identifier used to deduplicate the style element. */
    id?: string;
    /** Raw CSS text or supplier that resolves to CSS. */
    css: InlineContentSource;
    /** Where the style tag should be appended. Defaults to `head`. */
    injectTo?: InlineAssetTarget;
};

export type InlineScriptAsset = {
    /** Optional identifier used to deduplicate the script element. */
    id?: string;
    /** JavaScript code or supplier that resolves to code. */
    code: InlineContentSource;
    /** Explicit script type attribute. */
    type?: string;
    /** Convenience flag to mark the script as a module. */
    module?: boolean;
    /** Where the script tag should be appended. Defaults to `head`. */
    injectTo?: InlineAssetTarget;
};

type InlineStyleOverrides = Omit<InlineStyleAsset, "css">;
type InlineScriptOverrides = Omit<InlineScriptAsset, "code">;

async function resolveModuleString(loader: ModuleLoader<string>): Promise<string> {
    const mod = await loader();
    if (typeof mod === "string") return mod;
    if (mod && typeof mod === "object" && "default" in mod && typeof mod.default === "string") {
        return mod.default;
    }
    throw new Error("Inline asset module did not resolve to a string export.");
}

export function inlineStyleFromModule(loader: ModuleLoader<string>, overrides: InlineStyleOverrides = {}): InlineStyleAsset {
    return {
        ...overrides,
        css: () => resolveModuleString(loader),
    };
}

export function inlineScriptFromModule(loader: ModuleLoader<string>, overrides: InlineScriptOverrides = {}): InlineScriptAsset {
    return {
        ...overrides,
        code: () => resolveModuleString(loader),
    };
}

export type InlineAssetBundle = {
    /** Unique feature key used for deduplication and dependency resolution. */
    feature: string;
    /** Loading strategy mirroring the external assets loader. Defaults to `startup`. */
    when?: WhenToLoad;
    /** Other bundles that must be injected first. */
    dependsOn?: string[];
    /** Inline styles to inject when the bundle is loaded. */
    styles?: InlineStyleAsset[];
    /** Inline scripts to inject when the bundle is loaded. */
    scripts?: InlineScriptAsset[];
};

/**
 * Manages inline CSS/JS snippets declared by extensions so plugins do not need
 * to touch the editor core when adding styles or behaviour.
 */
export class InlineAssetsPlugin extends ExtensiblePlugin<InlineAssetsExtensionPlugin> {

    private registry = new Map<string, InlineAssetBundle>();
    private inFlight = new Map<string, Promise<void>>();
    private done = new Set<string>();
    private root: HTMLElement | null = null;
    private injectedStyles = new Set<string>();
    private injectedScripts = new Set<string>();

    override setup(root: HTMLElement): void {

        this.root = root;
    }

    override attachExtensions(exts: InlineAssetsExtensionPlugin[]): void {

        for (const ext of exts) {

            const bundles = ext.bundles();
            const list = Array.isArray(bundles) ? bundles : [bundles];
            for (const bundle of list) {
                this.registry.set(bundle.feature, bundle);
            }
        }

        for (const bundle of this.registry.values()) {
            const when = bundle.when ?? "startup";
            if (when === "startup") {
                this.ensure(bundle.feature);
            } else if (when === "idle") {
                const idle = (globalThis as any).requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1));
                idle(() => this.ensure(bundle.feature));
            }
        }
    }

    public load(feature: string): Promise<void> {
        return this.ensure(feature);
    }

    private ensure(feature: string): Promise<void> {
        if (this.done.has(feature)) return Promise.resolve();
        const inflight = this.inFlight.get(feature);
        if (inflight) return inflight;

        const bundle = this.registry.get(feature);
        if (!bundle) {
            return Promise.reject(new Error(`Inline asset feature not registered: ${feature}`));
        }

        const p = Promise.all((bundle.dependsOn ?? []).map((dep) => this.ensure(dep)))
            .then(() => this.inject(bundle))
            .then(() => {
                this.done.add(feature);
                this.inFlight.delete(feature);
            });

        this.inFlight.set(feature, p);
        return p;
    }

    private async inject(bundle: InlineAssetBundle): Promise<void> {
        if (bundle.styles) {
            for (const style of bundle.styles) {
                await this.injectStyle(bundle.feature, style);
            }
        }

        if (bundle.scripts) {
            for (const script of bundle.scripts) {
                await this.injectScript(bundle.feature, script);
            }
        }
    }

    private async injectStyle(feature: string, style: InlineStyleAsset): Promise<void> {
        const idKey = style.id ? `id:${style.id}` : null;
        if (idKey && this.injectedStyles.has(idKey)) return;

        const css = await this.resolveContent(style.css);
        const key = idKey ?? this.styleKey(feature, css);
        if (this.injectedStyles.has(key)) return;

        const container = this.resolveContainer(style.injectTo ?? "head");
        if (!container) return;

        const doc = container.ownerDocument ?? document;
        const el = doc.createElement("style");
        el.textContent = css;
        el.dataset.inlineAssetFeature = feature;
        if (style.id) el.dataset.inlineAssetId = style.id;

        container.appendChild(el);
        this.injectedStyles.add(key);
    }

    private async injectScript(feature: string, script: InlineScriptAsset): Promise<void> {
        const idKey = script.id ? `id:${script.id}` : null;
        if (idKey && this.injectedScripts.has(idKey)) return;

        const code = await this.resolveContent(script.code);
        const key = idKey ?? this.scriptKey(feature, script, code);
        if (this.injectedScripts.has(key)) return;

        const container = this.resolveContainer(script.injectTo ?? "head");
        if (!container) return;

        const doc = container.ownerDocument ?? document;
        const el = doc.createElement("script");
        el.textContent = code;
        el.dataset.inlineAssetFeature = feature;
        if (script.id) el.dataset.inlineAssetId = script.id;
        if (script.type) {
            el.type = script.type;
        } else if (script.module) {
            el.type = "module";
        }

        container.appendChild(el);
        this.injectedScripts.add(key);
    }

    private resolveContainer(target: InlineAssetTarget): HTMLElement | null {
        switch (target) {
            case "head":
                return document.head ?? null;
            case "body":
                return document.body ?? null;
            case "root":
                return this.root;
            default:
                return document.head ?? null;
        }
    }

    private async resolveContent(source: InlineContentSource): Promise<string> {
        const value = typeof source === "function" ? source() : source;
        return await value;
    }

    private styleKey(feature: string, css: string): string {
        return `feature:${feature}::${css}`;
    }

    private scriptKey(feature: string, script: InlineScriptAsset, code: string): string {
        const type = script.type ?? (script.module ? "module" : "script");
        return `feature:${feature}::${code}::${type}`;
    }
}

export abstract class InlineAssetsExtensionPlugin extends PluginExtension<InlineAssetsPlugin> {

    override readonly target = InlineAssetsPlugin;

    abstract bundles(): InlineAssetBundle | InlineAssetBundle[];
}