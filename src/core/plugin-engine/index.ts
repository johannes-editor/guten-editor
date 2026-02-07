import type { PluginManager } from "./plugin-manager.ts";

let pluginManager: PluginManager | null = null;

export const init = async (root: HTMLElement) => {
    if (!pluginManager) {
        const { PluginManager } = await import("./plugin-manager.ts");
        pluginManager = new PluginManager();
    }

    await pluginManager.init(root);
};

export * from "./plugin.ts";
export * from "./plugin-extension.ts";
export * from "./extensible-plugin.ts";