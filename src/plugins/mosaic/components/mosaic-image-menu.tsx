import { t } from "@core/i18n";
import { runCommand } from "@core/command";
import { DefaultProps, DefaultState } from "@core/components";
import { OverlayComponent } from "@components/editor/overlay";
import { saveLocalImage } from "@utils/media";

export interface MosaicImageMenuProps extends DefaultProps {
    target?: HTMLElement | null;
    anchorRect?: DOMRectInit;
    initialUrl?: string;
    initialTab?: "upload" | "embed";
}

interface MosaicImageMenuState extends DefaultState {
    activeTab: "upload" | "embed";
    isUploading: boolean;
    error: string | null;
    embedUrl: string;
}

export class MosaicImageMenu extends OverlayComponent<MosaicImageMenuProps, MosaicImageMenuState> {

    override state: MosaicImageMenuState = {
        activeTab: "upload",
        isUploading: false,
        error: null,
        embedUrl: "",
    };

    override positionToAnchorVerticalGap = 10;

    private target: HTMLElement | null = null;
    private anchorRect: DOMRect | null = null;
    private urlInput: HTMLInputElement | null = null;
    private fileInput: HTMLInputElement | null = null;
    private uploadButton: HTMLButtonElement | null = null;

    private readonly reservedDatasetKeys = new Set(["imageSource", "imageAlt", "mosaicTile", "mosaicImage"]);

    static override styles = this.extendStyles(/*css*/`
        .mosaic-image-menu {
            width: 340px;
            display: flex;
            flex-direction: column;
            background: var(--color-surface);
            border-radius: var(--radius-md);
            overflow: hidden;
        }

        .mosaic-image-menu__tabs {
            display: flex;
            border-bottom: 1px solid var(--color-border);
        }

        .mosaic-image-menu__tab {
            flex: 1;
            border: none;
            background: transparent;
            padding: var(--space-sm) var(--space-md);
            font-weight: 600;
            font-size: var(--font-size-xs);
            cursor: pointer;
            color: var(--color-muted);
            border-bottom: 2px solid transparent;
        }

        .mosaic-image-menu__tab--active {
            color: var(--color-primary);
            border-color: var(--color-primary);
        }

        .mosaic-image-menu__content {
            padding: var(--space-md);
            display: flex;
            flex-direction: column;
            gap: var(--space-sm);
        }

        .mosaic-image-menu__upload-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: var(--space-sm);
            border-radius: var(--radius-sm);
            border: 1px solid var(--color-primary);
            background: var(--color-primary);
            cursor: pointer;
            transition: background 0.2s ease;
            font-weight: 500;
            color: var(--color-light);
        }

        .mosaic-image-menu__upload-button[disabled] {
            opacity: 0.6;
            cursor: default;
        }

        .mosaic-image-menu__file-input {
            display: none;
        }

        .mosaic-image-menu__help {
            font-size: var(--font-size-xxs);
            color: var(--color-muted);
            margin: 0;
        }

        .mosaic-image-menu__input {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid var(--color-border);
            border-radius: var(--radius-sm);
            padding: var(--space-sm);
            font-size: var(--font-size-sm);
            background-color: var(--color-surface-muted);
            color: var(--color-text);
        }

        .mosaic-image-menu__actions {
            display: flex;
            flex-direction: column;
            gap: var(--space-sm);
        }

        .mosaic-image-menu__primary-button {
            background: var(--color-primary);
            color: var(--color-light);
            border: none;
            border-radius: var(--radius-sm);
            padding: var(--space-sm);
            cursor: pointer;
            width: 100%;
            margin: 0 auto;
        }

        .mosaic-image-menu__primary-button[disabled] {
            opacity: 0.6;
            cursor: default;
        }

        .mosaic-image-menu__error {
            font-size: var(--font-size-xxs);
            color: var(--color-danger, #c92a2a);
            margin: 0;
        }
    `);

    override connectedCallback(): void {
        const initialTab = this.props.initialTab ?? (this.props.initialUrl ? "embed" : "upload");
        const initialUrl = this.props.initialUrl ?? "";
        this.state = { ...this.state, activeTab: initialTab, embedUrl: initialUrl };
        super.connectedCallback();
        this.classList.add("card", "mosaic-image-menu");
        this.closeOnClickOutside = true;
    }

    override onMount(): void {
        this.target = this.props.target ?? null;

        const rect = this.props.anchorRect
            ? this.toDOMRect(this.props.anchorRect)
            : this.target?.getBoundingClientRect?.() ?? null;

        if (rect) {
            this.anchorRect = rect;
            this.positionToAnchor(rect);
            this.ensureWithinViewport(rect);
        }
    }

    override render(): HTMLElement {
        return (
            <div class="mosaic-image-menu guten-modal--sheet-mobile-w100 outline-none">
                <div class="mosaic-image-menu__tabs" role="tablist">
                    {this.renderTabButton("upload", t("image_tab_upload"))}
                    {this.renderTabButton("embed", t("image_tab_embed"))}
                </div>
                <div class="mosaic-image-menu__content">
                    {this.state.activeTab === "upload" ? this.renderUploadTab() : this.renderEmbedTab()}
                    {this.state.error ? <p class="mosaic-image-menu__error">{this.state.error}</p> : null}
                </div>
            </div>
        );
    }

    private renderTabButton(tab: "upload" | "embed", label: string): HTMLElement {
        const isActive = this.state.activeTab === tab;
        return (
            <button
                type="button"
                class={`mosaic-image-menu__tab ${isActive ? "mosaic-image-menu__tab--active" : ""}`}
                onClick={(event: MouseEvent) => this.switchTab(tab, event)}
            >
                {label}
            </button>
        );
    }

    private renderUploadTab(): HTMLElement {
        const isDisabled = this.state.isUploading;

        return (
            <div class="mosaic-image-menu__actions">
                <input
                    ref={(el: HTMLInputElement | null) => {
                        this.fileInput = el;
                    }}
                    class="mosaic-image-menu__file-input"
                    type="file"
                    accept="image/*"
                    onChange={(event: Event) => this.handleFileChange(event)}
                />
                <button
                    ref={(el: HTMLButtonElement | null) => {
                        this.uploadButton = el;
                    }}
                    type="button"
                    class="mosaic-image-menu__upload-button"
                    onClick={() => this.openFilePicker()}
                    {...(isDisabled ? { disabled: "" } : {})}
                >
                    {this.state.isUploading ? t("image_uploading") : t("image_upload_button")}
                </button>
                <p class="mosaic-image-menu__help">{t("image_upload_description")}</p>
            </div>
        );
    }

    private renderEmbedTab(): HTMLElement {
        const isDisabled = !this.canSubmitEmbed();

        return (
            <div class="mosaic-image-menu__actions">
                <input
                    ref={(el: HTMLInputElement | null) => {
                        this.urlInput = el;
                    }}
                    class="mosaic-image-menu__input"
                    type="url"
                    placeholder={t("image_url_placeholder")}
                    value={this.state.embedUrl}
                    onInput={(event: Event) => this.handleEmbedInput(event)}
                    required
                />
                <button
                    type="button"
                    class="mosaic-image-menu__primary-button"
                    onClick={() => this.handleEmbedInsert()}
                    {...(isDisabled ? { disabled: "" } : {})}
                >
                    {t("insert")}
                </button>
            </div>
        );
    }

    private switchTab(tab: "upload" | "embed", event?: MouseEvent): void {
        event?.preventDefault();
        event?.stopPropagation();
        if (this.state.activeTab === tab) return;
        this.setState({ activeTab: tab, error: null } as Partial<MosaicImageMenuState>);
    }

    private openFilePicker(): void {
        const input = this.fileInput;
        if (!input) return;
        input.click();
    }

    private handleFileChange(event: Event): void {
        const input = event.target as HTMLInputElement | null;
        const file = input?.files?.[0] ?? null;
        if (!file) return;

        void this.uploadFile(file);
        if (input) input.value = "";
    }

    private async uploadFile(file: File): Promise<void> {
        this.setState({ isUploading: true, error: null } as Partial<MosaicImageMenuState>);

        try {
            const url = await saveLocalImage(file);
            this.insertImage({
                url,
                alt: file.name,
            });
        } catch {
            this.setState({ error: t("image_upload_error") } as Partial<MosaicImageMenuState>);
        } finally {
            this.setState({ isUploading: false } as Partial<MosaicImageMenuState>);
        }
    }

    private handleEmbedInsert(): void {
        const value = this.getEmbedUrl();

        if (!value) {
            this.urlInput?.setCustomValidity(t("image_url_required"));
            this.urlInput?.reportValidity();
            return;
        }

        if (!this.isValidUrl(value)) {
            this.urlInput?.setCustomValidity(t("invalid_image_url"));
            this.urlInput?.reportValidity();
            return;
        }

        this.insertImage({
            url: value,
            alt: this.getTargetAlt(),
        });
    }

    private isValidUrl(value: string): boolean {
        if (value.startsWith("data:") || value.startsWith("guten-image://")) return true;

        try {
            const url = new URL(value);
            return url.protocol === "http:" || url.protocol === "https:" || url.protocol === "data:";
        } catch {
            return false;
        }
    }

    private insertImage(result: { url: string; alt?: string }): void {
        const target = this.target;
        const alt = result.alt ?? this.getTargetAlt();

        this.remove();

        requestAnimationFrame(() => {
            runCommand("insertMosaicImage", {
                content: {
                    target: target ?? undefined,
                    sourceUrl: result.url,
                    alt,
                    dataset: this.getTargetDataset(),
                },
            });
        });
    }

    private handleEmbedInput(event: Event): void {
        const input = event.target as HTMLInputElement | null;
        const value = input?.value ?? "";
        this.urlInput?.setCustomValidity("");
        this.setState({ embedUrl: value, error: null } as Partial<MosaicImageMenuState>);
    }

    private getEmbedUrl(): string {
        return this.state.embedUrl.trim();
    }

    private canSubmitEmbed(): boolean {
        if (this.state.isUploading) return false;
        const value = this.getEmbedUrl();
        if (!value) return false;
        return this.isValidUrl(value);
    }

    private getTargetAlt(): string | undefined {
        const alt = this.target?.dataset?.imageAlt;
        return alt && alt.length > 0 ? alt : undefined;
    }

    private getTargetDataset(): Record<string, string> | undefined {
        if (!this.target) return undefined;

        const dataset: Record<string, string> = {};
        for (const [key, value] of Object.entries(this.target.dataset)) {
            if (this.reservedDatasetKeys.has(key)) continue;
            if (value) dataset[key] = value;
        }

        return Object.keys(dataset).length ? dataset : undefined;
    }

    private toDOMRect(rectInit: DOMRectInit): DOMRect {
        const x = rectInit.x ?? 0;
        const y = rectInit.y ?? 0;
        const width = rectInit.width ?? 0;
        const height = rectInit.height ?? 0;
        return typeof DOMRect.fromRect === "function"
            ? DOMRect.fromRect({ x, y, width, height })
            : new DOMRect(x, y, width, height);
    }

    private ensureWithinViewport(anchorRect: DOMRect): void {
        const viewportWidth = globalThis.innerWidth || document.documentElement?.clientWidth || 0;
        if (!viewportWidth) return;

        const overlayRect = this.getBoundingClientRect();
        if (!overlayRect.width) return;

        const horizontalGap = this.positionToAnchorHorizontalGap;
        const anchorWidth = anchorRect.width ?? 0;
        const anchorCenter = anchorRect.left + anchorWidth / 2;
        const desiredLeft = anchorCenter - overlayRect.width / 2;
        const minLeft = horizontalGap;
        const maxLeft = Math.max(viewportWidth - overlayRect.width - horizontalGap, minLeft);
        const clampedLeft = Math.min(Math.max(desiredLeft, minLeft), maxLeft);

        this.style.left = `${clampedLeft}px`;
        this.style.right = "";
    }
}