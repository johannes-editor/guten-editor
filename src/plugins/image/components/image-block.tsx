import { ensureBlockId } from "@utils/dom";
import { applyImageSourceToElement } from "@utils/media";

export interface ImageBlockProps {
    src: string;
    alt?: string;
    dataset?: Record<string, string>;
    className?: string;
    blockId?: string;
    [key: string]: unknown;
}

type ImageDatasetProps = Pick<ImageBlockProps, "src" | "alt" | "dataset" | "blockId">;

const IMAGE_BLOCK_STYLE_ID = "guten-image-block-styles";
const IMAGE_BLOCK_SELECTOR = "figure.image-block";

export const IMAGE_BLOCK_RESERVED_DATASET_KEYS = [
    "blockId",
    "imageSource",
    "imageAlt",
    "imagePlaceholder",
    "imageEmbed",
] as const;

const RESERVED_DATASET_KEYS = new Set<string>(IMAGE_BLOCK_RESERVED_DATASET_KEYS);

const IMAGE_BLOCK_STYLES = /*css*/`
    figure.image-block {
        display: block;
        margin: 0;
    }

    figure.image-block img {
        display: block;
        max-width: 100%;
        height: auto;
        border-radius: var(--radius-sm);
    }
`;

function ensureImageBlockStyles(): void {
    if (typeof document === "undefined") return;
    if (document.getElementById(IMAGE_BLOCK_STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = IMAGE_BLOCK_STYLE_ID;
    style.textContent = IMAGE_BLOCK_STYLES;
    document.head.appendChild(style);
}

function applyDataset(target: HTMLElement, props: ImageDatasetProps): void {
    const blockId = props.blockId && props.blockId.length > 0 ? props.blockId : undefined;
    const resolvedId = ensureBlockId(target, blockId);
    target.dataset.blockId = resolvedId;
    target.dataset.imageEmbed = "true";
    target.dataset.imageSource = props.src;

    if (typeof props.alt === "string" && props.alt.length > 0) {
        target.dataset.imageAlt = props.alt;
    } else {
        delete target.dataset.imageAlt;
    }

    for (const key of Object.keys(target.dataset)) {
        if (RESERVED_DATASET_KEYS.has(key)) continue;
        delete (target.dataset as Record<string, string | undefined>)[key];
    }

    if (!props.dataset) return;

    for (const [key, value] of Object.entries(props.dataset)) {
        if (value == null || RESERVED_DATASET_KEYS.has(key)) continue;
        target.dataset[key] = value;
    }
}

export function ImageBlock(props: ImageBlockProps) {
    const { src, alt, dataset, className, blockId, ...rest } = props;
    const classNames = ["block", "image-block"];
    if (typeof className === "string" && className.trim().length > 0) {
        classNames.push(className);
    }

    const figureProps: Record<string, unknown> = {
        ...rest,
        className: classNames.join(" "),
        contenteditable: "false",
    };

    const assignRef = (element: HTMLElement | null) => {
        if (!element) return;
        applyDataset(element, { src, alt, dataset, blockId });
    };

    return (
        <figure {...figureProps} ref={assignRef}>
            <img
                src={src}
                alt={alt ?? ""}
                draggable={false}
                ref={(image: HTMLImageElement | null) => {
                    if (!image) return;
                    void applyImageSourceToElement(image, src);
                }}
            />
        </figure>
    );
}

export function createImageBlock(props: ImageBlockProps): HTMLElement {
    ensureImageBlockStyles();
    const element = <ImageBlock {...props} /> as HTMLElement;
    applyDataset(element, props);
    return element;
}

export function isImageBlockElement(node: Element | null | undefined): boolean {
  return node instanceof HTMLElement && node.matches(IMAGE_BLOCK_SELECTOR);
}

export function updateImageBlockElement(element: HTMLElement, props: ImageBlockProps): void {
    if (!isImageBlockElement(element)) return;
    const img = element.querySelector<HTMLImageElement>("img");
    if (!img) return;

    void applyImageSourceToElement(img, props.src);

    if (img.src !== props.src) {
        img.src = props.src;
    }

    img.alt = props.alt ?? "";
    applyDataset(element, props);
}

export function extractImageBlockDataset(element: HTMLElement): Record<string, string> | undefined {
    const entries = Object.entries(element.dataset).filter(([key]) => !RESERVED_DATASET_KEYS.has(key));
    if (!entries.length) return undefined;

    const dataset: Record<string, string> = {};
    for (const [key, value] of entries) {
        if (value != null) {
            dataset[key] = value;
        }
    }

    return Object.keys(dataset).length ? dataset : undefined;
}

export function findImageBlockById(blockId: string): HTMLElement | null {
    if (!blockId || typeof document === "undefined") return null;
    const candidates = document.querySelectorAll<HTMLElement>(IMAGE_BLOCK_SELECTOR);
    for (const candidate of Array.from(candidates)) {
        if (candidate.dataset.blockId === blockId) {
            return candidate;
        }
    }
    return null;
}