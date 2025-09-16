# Inline Assets Plugin

The Inline Assets plugin lets feature extensions ship small snippets of CSS or JavaScript without editing the editor's core bundles. It injects each asset only once, respects declared dependencies, and mirrors the loading strategies of the external asset loader.

## Architecture

- `InlineAssetsPlugin` keeps a registry of named asset bundles and injects them on demand.
- `InlineAssetsExtensionPlugin` is the base class for extensions. Implement `bundles()` to return one bundle or an array of bundles.
- Each `InlineAssetBundle` describes a feature, its dependencies, when it should load, and the inline styles and scripts that belong to it.

## Declaring bundles

```ts
export class MyFeatureAssets extends InlineAssetsExtensionPlugin {
    bundles(): InlineAssetBundle {
        return {
            feature: "my-feature-assets",
            when: "startup", // "startup" (default) or "idle"
            dependsOn: ["other-feature"],
            styles: [
                { id: "my-style", css: ".my-class { color: red; }" },
            ],
            scripts: [
                { id: "my-script", code: "console.log('ready');" },
            ],
        };
    }
}
```

Inline CSS/JS can be provided directly as strings or via functions that lazily
resolve to a string (`string | (() => string | Promise<string>)`). Lazy loaders
allow you to defer dynamic `import()` calls until the bundle is requested.

### Loading from files

When bundling with Vite (or any tool that understands `?inline`/`?raw`
queries), keep CSS/JS in standalone files and leverage the helper factories to
inject them:

```ts
import {
    inlineStyleFromModule,
    inlineScriptFromModule,
} from "../inline-assets/inline-assets-plugin.ts";

export class MyFeatureAssets extends InlineAssetsExtensionPlugin {
    bundles(): InlineAssetBundle {
        return {
            feature: "my-feature-assets",
            styles: [
                inlineStyleFromModule(
                    () => import("./my-feature.css?inline"),
                    { id: "my-style" },
                ),
            ],
            scripts: [
                inlineScriptFromModule(
                    () => import("./my-feature.js?inline"),
                    { id: "my-script", module: true },
                ),
            ],
        };
    }
}
```

The helpers accept loaders that resolve to a string (or a module exposing a
string `default` export) and return `InlineStyleAsset`/`InlineScriptAsset`
objects that the plugin can inject.

## Style injection

- Styles default to inserting `<style>` tags in `document.head`. Set `injectTo` to `"body"` or `"root"` to use another container.
- Provide an `id` to deduplicate styles regardless of their CSS text.
- The plugin tags injected elements with `data-inline-asset-feature` (and `data-inline-asset-id` when present) so they can be inspected or removed manually.

## Script injection

- Scripts default to `document.head`. Use `injectTo` to target `"body"` or the editor root element.
- Set `module: true` or an explicit `type` to control the `<script>` attributes.
- Scripts run immediately after insertion. Avoid long-running code; defer complex logic to modular plugins.

## Runtime loading

- Bundles marked `when: "startup"` are loaded as soon as the plugin initializes. Use `"idle"` for lower-priority assets.
- Other plugins can call `inlineAssets.load("feature")` to ensure a bundle and its dependencies are ready before they execute.

## Best practices

1. Keep snippets concise; large assets should remain external files.
2. Namespace generated CSS to the feature to avoid collisions.
3. Use dependency chains to share base styles without re-injecting them.
4. Prefer `id` fields for deterministic deduplication when bundles may repeat across manifests.