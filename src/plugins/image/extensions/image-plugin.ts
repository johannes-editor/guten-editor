import { runCommand } from "@core/command/index.ts";
import { Plugin } from "@core/plugin-engine/plugin.ts";
import { IMAGE_REPLACE_EVENT, type ImageReplaceEventDetail } from "../image-events.ts";

export interface ImageUploadResult {
    url: string;
    alt?: string;
    dataset?: Record<string, string>;
}

export type ImageUploadHandler = (file: File) => Promise<ImageUploadResult | string> | ImageUploadResult | string;

export interface ImagePluginOptions {
    upload?: ImageUploadHandler;
}

export class ImagePlugin extends Plugin {

    private static options: ImagePluginOptions = {};
    private static listenerBound = false;

    static configure(options: ImagePluginOptions): void {
        this.options = { ...(this.options ?? {}), ...(options ?? {}) };
    }

    static getOptions(): ImagePluginOptions {
        return this.options;
    }

    private static handleImageReplace(event: Event): void {
        const customEvent = event as CustomEvent<ImageReplaceEventDetail>;
        const detail = customEvent.detail;
        if (!detail?.blockId || !detail.url) return;

        runCommand("replaceImage", { content: detail });
    }

    override setup(_root: HTMLElement, _plugins: Plugin[]): void {
        if (typeof document === "undefined") return;
        if (ImagePlugin.listenerBound) return;

        document.addEventListener(IMAGE_REPLACE_EVENT, ImagePlugin.handleImageReplace as EventListener);
        ImagePlugin.listenerBound = true;
    }
}