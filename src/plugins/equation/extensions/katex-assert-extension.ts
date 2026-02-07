import { AssetBundle } from "@core/asset-loader/types.ts";
import { ExternalAssetsExtensionPlugin } from "@plugin/external-assets/external-assets-plugin.ts";

/**
 * Loads KaTeX CSS/JS at editor startup
 */
export class KatexAssetsExtension extends ExternalAssetsExtensionPlugin {

    bundles(): AssetBundle {
        return {
            feature: "katex",
            when: "startup",
            dependsOn: [],
            assets: [
                {
                    type: "style",
                    href: "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css",
                    insertAt: "headEnd",
                },
                {
                    type: "script",
                    src: "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js",
                    insertAt: "headEnd",
                    defer: true,
                    waitForGlobal: "katex"
                },
            ],
        };
    }
}