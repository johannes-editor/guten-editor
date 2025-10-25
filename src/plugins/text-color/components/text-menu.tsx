/** @jsx h */
import { FormattingToolbar, FormattingToolbarContext, FormattingToolbarCtx, h, MenuUI, MenuUIProps, runCommand, t } from "../../index.ts";
import type { MenuUIState } from "../../../design-system/components/menu-ui.tsx";
import { useContext } from "../../../core/context/context.ts";
import { TextColorMenuItem } from "./color-menu-item.tsx";
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
            overflow-y: scroll; 
        }       
    `);

    override state: TextColorMenuState = {
        selectedIndex: 0,
        textValue: TEXT_COLOR_OPTIONS[0]?.value ?? "",
        highlightValue: HIGHLIGHT_COLOR_OPTIONS[0]?.value ?? "",
    };

    private formattingToolbar: FormattingToolbarContext | undefined | null = null;
    private selectionLocked = false;

    override onMount(): void {
        super.onMount?.();
        this.formattingToolbar = useContext(this, FormattingToolbarCtx);
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
        const textItems = TEXT_COLOR_OPTIONS.map((option) => (
            <TextColorMenuItem
                option={option}
                isActive={this.isTextColorActive}
                onSelectOption={this.handleTextColorSelect}
            />
        )) as HTMLElement[];

        const highlightItems = HIGHLIGHT_COLOR_OPTIONS.map((option) => (
            <TextColorMenuItem
                option={option}
                isActive={this.isHighlightColorActive}
                onSelectOption={this.handleHighlightColorSelect}
            />
        )) as HTMLElement[];

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
        this.setState({ textValue: option.value } as Partial<TextColorMenuState>);
        runCommand("setTextColor", { content: { color: option.value } });
        // this.remove();
    };

    private handleHighlightColorSelect = (option: ColorOption) => {
        this.unlockSelection();
        this.setState({ highlightValue: option.value } as Partial<TextColorMenuState>);
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
}