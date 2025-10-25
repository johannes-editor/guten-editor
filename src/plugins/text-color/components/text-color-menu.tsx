/** @jsx h */
import { FormattingToolbar, FormattingToolbarContext, FormattingToolbarCtx, colorUtil, h, MenuUI, MenuUIProps, runCommand, t } from "../../index.ts";
import type { MenuUIState } from "../../../design-system/components/menu-ui.tsx";
import { useContext } from "../../../core/context/context.ts";
import { TextColorMenuItem } from "./text-color-menu-item.tsx";
import { HIGHLIGHT_COLOR_OPTIONS, normalizeColorValue, TEXT_COLOR_OPTIONS, type ColorOption } from "../color-options.ts";

interface TextColorMenuProps extends MenuUIProps {
    anchor?: HTMLElement;
}

interface TextColorMenuState extends MenuUIState {
    highlightValue: string;
    textValue: string;
}

export class TextColorMenu extends MenuUI<TextColorMenuProps, TextColorMenuState> {

    // override lockScroll = true;
    override positionToAnchorVerticalGap: number = 12;
    override positionToAnchorHorizontalGap: number = -20;

    static override get tagName() {
        return "guten-formatting-highlight-color-menu";
    }

    protected override positionMode: "none" | "relative" | "anchor" = "anchor";
    protected override lockWidthOnOpen = true;
    override canOverlayClasses = new Set([FormattingToolbar]);


    static override styles = this.extendStyles(/*css*/`

        guten-formatting-highlight-color-menu {
            opacity: 0;
            max-height: 350px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        guten-formatting-highlight-color-menu .guten-menu {
            max-height: inherit;
            overflow-y: auto;
            scrollbar-gutter: stable;
        }
    `);

    override state: TextColorMenuState = {
        selectedIndex: 0,
        textValue: TEXT_COLOR_OPTIONS[0]?.value ?? "",
        highlightValue: HIGHLIGHT_COLOR_OPTIONS[0]?.value ?? "",
    };

    private formattingToolbar: FormattingToolbarContext | undefined | null = null;
    private selectionLocked = false;

    private textItems: TextColorMenuItem[] = [];
    private highlightItems: TextColorMenuItem[] = [];

    override onMount(): void {
        super.onMount?.();
        this.formattingToolbar = useContext(this, FormattingToolbarCtx);

        this.syncSelectionColors();

        if (this.formattingToolbar?.lock) {
            this.formattingToolbar.lock();
            this.selectionLocked = true;
        }
    }

    override onUnmount(): void {
        this.unlockSelection();
        super.onUnmount?.();
    }

    override render(): HTMLElement {
        this.props.children = this.buildChildren();
        return super.render();
    }

    private buildChildren(): HTMLElement[] {
        this.textItems = [];
        const textItems = TEXT_COLOR_OPTIONS.map((option) => {
            const item = (
                <TextColorMenuItem
                    option={option}
                    isActive={this.isTextColorActive}
                    onSelectOption={this.handleTextColorSelect}
                />
            ) as unknown as TextColorMenuItem;
            this.textItems.push(item);
            return item as unknown as HTMLElement;
        });

        this.highlightItems = [];
        const highlightItems = HIGHLIGHT_COLOR_OPTIONS.map((option) => {
            const item = (
                <TextColorMenuItem
                    option={option}
                    isActive={this.isHighlightColorActive}
                    onSelectOption={this.handleHighlightColorSelect}
                />
            ) as unknown as TextColorMenuItem;
            this.highlightItems.push(item);
            return item as unknown as HTMLElement;
        });

        return [
            <div class="guten-menu-label">{t("text_color")}</div> as HTMLElement,
            ...textItems,
            <hr class="guten-menu-separator" /> as HTMLElement,
            <div class="guten-menu-label">{t("highlight_color")}</div> as HTMLElement,
            ...highlightItems,
        ];
    }

    private handleTextColorSelect = (option: ColorOption) => {
        this.unlockSelection();
        this.updateStateSilently({ textValue: option.value });
        this.refreshActiveItems("text");
        runCommand("setTextColor", { content: { color: option.value } });
        // this.remove();
    };

    private handleHighlightColorSelect = (option: ColorOption) => {
        this.unlockSelection();
        this.updateStateSilently({ highlightValue: option.value });
        this.refreshActiveItems("highlight");
        runCommand("setHighlightColor", { content: { color: option.value } });
        // this.remove();
    };


    private isHighlightColorActive = (option: ColorOption): boolean => {
        return normalizeColorValue(this.state.highlightValue) === normalizeColorValue(option.value);
    };

    private isTextColorActive = (option: ColorOption): boolean => {
        return normalizeColorValue(this.state.textValue) === normalizeColorValue(option.value);
    };

    private unlockSelection(): void {
        if (!this.selectionLocked) return;
        this.formattingToolbar?.unlock?.();
        this.selectionLocked = false;
    }


    private updateStateSilently(partial: Partial<TextColorMenuState>) {
        this.state = { ...this.state, ...partial } as TextColorMenuState;
    }

    private refreshActiveItems(section: "text" | "highlight") {
        const items = section === "text" ? this.textItems : this.highlightItems;
        const matcher = section === "text" ? this.isTextColorActive : this.isHighlightColorActive;

        for (const item of items) {
            if (!item) continue;
            const isActive = matcher(item.props.option);
            if (Boolean(item.state?.isActive) === isActive) continue;
            item.setState({ isActive });
        }
    }

    public override setState(partial: Partial<TextColorMenuState>) {
        const { textValue, highlightValue, ...rest } = partial;

        if (textValue !== undefined) {
            this.updateStateSilently({ textValue });
            this.refreshActiveItems("text");
        }

        if (highlightValue !== undefined) {
            this.updateStateSilently({ highlightValue });
            this.refreshActiveItems("highlight");
        }

        const restKeys = Object.keys(rest as Record<string, unknown>);
        if (restKeys.length === 0) return;

        const scroller = this.querySelector<HTMLElement>(".guten-menu");
        const scrollTop = scroller?.scrollTop ?? null;
        const scrollLeft = scroller?.scrollLeft ?? null;

        super.setState(rest as Partial<TextColorMenuState>);

        if (scrollTop === null) return;

        const nextScroller = this.querySelector<HTMLElement>(".guten-menu");
        if (!nextScroller) return;
        nextScroller.scrollTop = scrollTop;
        nextScroller.scrollLeft = scrollLeft ?? 0;
    }

    private syncSelectionColors(): void {
        const anchor = colorUtil.getSelectionAnchorElement();
        const target = anchor ?? document.body;
        if (!target) return;

        const styles = getComputedStyle(target);

        const textColor = normalizeColorValue(styles.color ?? "");
        if (textColor) {
            const matchedText = this.findMatchingOption(TEXT_COLOR_OPTIONS, textColor, anchor, "color");
            const nextTextValue = matchedText?.value ?? textColor;
            this.updateStateSilently({ textValue: nextTextValue });
            this.refreshActiveItems("text");
        }

        const backgroundColorRaw = normalizeColorValue(styles.backgroundColor ?? "");
        const backgroundColor = backgroundColorRaw
            && backgroundColorRaw !== "initial"
            && backgroundColorRaw !== "inherit"
            ? backgroundColorRaw
            : "transparent";

        const matchedHighlight = this.findMatchingOption(
            HIGHLIGHT_COLOR_OPTIONS,
            backgroundColor,
            anchor,
            "backgroundColor",
        );
        const nextHighlightValue = matchedHighlight?.value ?? backgroundColor;
        this.updateStateSilently({ highlightValue: nextHighlightValue });
        this.refreshActiveItems("highlight");
    }

    private findMatchingOption(
        options: ColorOption[],
        selectionColor: string,
        anchor: HTMLElement | null,
        property: "color" | "backgroundColor",
    ): ColorOption | undefined {
        const normalizedSelection = normalizeColorValue(selectionColor);
        if (!normalizedSelection) return undefined;

        for (const option of options) {
            const optionColor = this.resolveOptionColor(option, anchor, property);
            if (optionColor && optionColor === normalizedSelection) {
                return option;
            }
        }
        return undefined;
    }

    private resolveOptionColor(
        option: ColorOption,
        anchor: HTMLElement | null,
        property: "color" | "backgroundColor",
    ): string {
        const target = anchor ?? document.body;
        if (!target) return "";

        const probe = document.createElement("span");
        probe.style.all = "unset";
        probe.style.position = "fixed";
        probe.style.visibility = "hidden";
        probe.style.pointerEvents = "none";
        probe.textContent = "";

        if (property === "color") {
            probe.style.color = option.value;
        } else {
            probe.style.backgroundColor = option.value;
            probe.style.background = option.value;
        }

        target.appendChild(probe);
        const computed = getComputedStyle(probe)[property] ?? "";
        probe.remove();

        return normalizeColorValue(computed);
    }
}