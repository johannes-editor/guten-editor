/** @jsx h */
import { h, MenuUI, MenuUIProps, runCommand, t } from "../../index.ts";
import type { MenuUIState } from "../../../design-system/components/menu-ui.tsx";
import { useContext } from "../../../core/context/context.ts";
import { FormattingToolbarCtx, FormattingToolbarContext } from "../formatting-toolbar-context.ts";
import { FormattingToolbar } from "./formatting-toolbar.tsx";
import { FormattingToolbarColorMenuItem } from "./color-menu-item.tsx";
import { HIGHLIGHT_COLOR_OPTIONS, TEXT_COLOR_OPTIONS, normalizeColorValue, type ColorOption } from "./color-options.ts";

interface FormattingToolbarColorMenuProps extends MenuUIProps {
    anchor?: HTMLElement;
}

interface FormattingToolbarForeColorMenuState extends MenuUIState {
    textValue: string;
    highlightValue: string;
}

export class FormattingToolbarForeColorMenu extends MenuUI<FormattingToolbarColorMenuProps, FormattingToolbarForeColorMenuState> {


    override positionToAnchorVerticalGap: number = 12;
    override positionToAnchorHorizontalGap: number = -20;

    static override get tagName() {
        return "guten-formatting-fore-color-menu";
    }

    protected override positionMode: "none" | "relative" | "anchor" = "anchor";
    protected override lockWidthOnOpen = true;
    override canOverlayClasses = new Set([FormattingToolbar]);


    static override styles = this.extendStyles(/*css*/`
        
        guten-formatting-fore-color-menu {
            opacity: 0;
        }       
    `);

    override state: FormattingToolbarForeColorMenuState = {
        selectedIndex: 0,
        textValue: TEXT_COLOR_OPTIONS[0]?.value ?? "",
        highlightValue: HIGHLIGHT_COLOR_OPTIONS[0]?.value ?? "",
    };

    private formattingToolbar: FormattingToolbarContext | undefined | null = null;
    private selectionLocked = false;

    override onMount(): void {
        this.syncWithSelection();
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
            <FormattingToolbarColorMenuItem
                option={option}
                isActive={this.isTextColorActive}
                onSelectOption={this.handleTextColorSelect}
            />
        )) as HTMLElement[];

        return [
            ...textItems,
        ];
    }

    private handleTextColorSelect = (option: ColorOption) => {
        this.unlockSelection();
        this.setState({ textValue: option.value } as Partial<FormattingToolbarForeColorMenuState>);
        runCommand("setTextColor", { content: { color: option.value } });
        this.remove();
    };

    private isTextColorActive = (option: ColorOption): boolean => {
        return normalizeColorValue(this.state.textValue) === normalizeColorValue(option.value);
    };

    private syncWithSelection(): void {
        const textValue = normalizeColorValue(this.queryCommandValue("foreColor"));
        const highlightValue = normalizeColorValue(
            this.queryCommandValue("hiliteColor") || this.queryCommandValue("backColor"),
        );

        this.setState({
            textValue: this.matchOptionValue(TEXT_COLOR_OPTIONS, textValue),
            highlightValue: this.matchOptionValue(HIGHLIGHT_COLOR_OPTIONS, highlightValue),
        } as Partial<FormattingToolbarForeColorMenuState>);
    }

    private matchOptionValue(options: ColorOption[], value: string): string {
        const normalized = normalizeColorValue(value);
        const match = options.find((option) => normalizeColorValue(option.value) === normalized);
        return match?.value ?? options[0]?.value ?? "";
    }

    private queryCommandValue(command: string): string {
        try {
            const result = document.queryCommandValue(command);
            return typeof result === "string" ? result : "";
        } catch {
            return "";
        }
    }

    private unlockSelection(): void {
        if (!this.selectionLocked) return;
        this.formattingToolbar?.unlock?.();
        this.selectionLocked = false;
    }
}