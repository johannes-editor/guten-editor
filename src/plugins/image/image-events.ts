export const IMAGE_ADDED_EVENT = "guten:image-added";
export const IMAGE_REPLACE_EVENT = "guten:image-replace";

export type ImageSourceType = "data-url" | "external-url";

export interface ImageAddedEventDetail {
    blockId: string;
    mediaType: "image";
    sourceType: ImageSourceType;
    src: string;
    alt?: string;
    dataset?: Record<string, string>;
    element: HTMLElement;
}

export interface ImageReplaceEventDetail {
    blockId: string;
    url: string;
    alt?: string;
    dataset?: Record<string, string>;
}

export function getImageSourceType(value: string): ImageSourceType {
    return value.startsWith("data:") ? "data-url" : "external-url";
}