/** @jsx h */

import { appendElementOnRootArea } from "../../components/editor/index.tsx";
import { h, Plugin,  hasSelection, icons, keyboard, runCommand, t } from "../index.ts";
import { MobileToolbar, MobileToolbarButton } from "./components/mobile-toolbar.tsx";

class MobileToolbarController {

    constructor(
        private readonly toolbar: MobileToolbar,
        private readonly getFormattingButtons: () => MobileToolbarButton[],
        private readonly contentArea: HTMLElement | null,
    ) {}

    private defaultButtons(): MobileToolbarButton[] {
        return [
            {
                id: "slash-menu",
                icon: () => <icons.SlashCommandIcon />,
                label: t("open_slash_menu"),
                onClick: () => {
                    this.dispatchSlashShortcut();
                },
            },
            {
                id: "move-up",
                icon: () => <icons.ArrowUpIcon />,
                label: t("move_up"),
                onClick: () => runCommand("moveBlockUp"),
            },
            {
                id: "move-down",
                icon: () => <icons.ArrowDownIcon />,
                label: t("move_down"),
                onClick: () => runCommand("moveBlockDown"),
            },
            {
                id: "delete-block",
                icon: () => <icons.TrashIcon />,
                label: t("delete"),
                onClick: () => runCommand("deleteBlock"),
            },
        ];
    }

    private dispatchSlashShortcut() {
        if (this.contentArea && !this.contentArea.contains(document.activeElement)) {
            this.contentArea.focus();
        }

        const selection = globalThis.getSelection?.();
        if (this.contentArea && selection && selection.rangeCount === 0) {
            const range = document.createRange();
            range.selectNodeContents(this.contentArea);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }

        const event = new KeyboardEvent("keydown", {
            key: keyboard.KeyboardKeys.Slash,
            code: "Slash",
            bubbles: true,
            cancelable: true,
        });
        document.dispatchEvent(event);
    }

    private mode: "default" | "selection" = "default";

    update(selectionActive: boolean) {
        const nextMode = selectionActive ? "selection" : "default";

        if (this.mode !== nextMode) {
            this.mode = nextMode;
            const buttons = nextMode === "selection"
                ? this.getFormattingButtons()
                : this.defaultButtons();
            this.toolbar.setButtons(buttons);
        } else if (selectionActive && nextMode === "selection") {
            this.toolbar.refreshActiveStates();
        }

        this.toolbar.setVisible(true);
    }

    forceDefault() {
        this.mode = "default";
        this.toolbar.setButtons(this.defaultButtons());
        this.toolbar.setVisible(true);
    }
}

export class MobileToolbarPlugin extends Plugin {

    private toolbar: MobileToolbar | null = null;
    private controller: MobileToolbarController | null = null;
    private contentArea: HTMLElement | null = null;
    private readonly handleSelectionChange = () => this.refresh();
    private readonly handlePointerUp = () => setTimeout(() => this.refresh(), 0);
    private readonly handleKeyUp = () => this.refresh();
    private readonly updateViewportOffset = () => {
        if (!this.toolbar) return;

        const viewport = globalThis.visualViewport;
        if (!viewport) {
            this.toolbar.style.removeProperty("--mobile-toolbar-bottom-offset");
            return;
        }

        const viewportBottom = viewport.height + viewport.offsetTop;
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const keyboardOffset = Math.max(0, Math.round(windowHeight - viewportBottom));
        this.toolbar.style.setProperty("--mobile-toolbar-bottom-offset", `${keyboardOffset}px`);
    };

    override setup(root: HTMLElement, _plugins: Plugin[]): void {
        this.contentArea = root.querySelector<HTMLElement>("#contentArea") ?? root.querySelector<HTMLElement>('[contenteditable="true"]');

        const toolbar = <MobileToolbar onAction={() => this.refresh()} />;
        appendElementOnRootArea(toolbar);

        this.toolbar = toolbar;
        this.controller = new MobileToolbarController(toolbar, () => this.buildFormattingButtons(), this.contentArea);
        this.controller.forceDefault();

        this.bindViewportListeners();

        document.addEventListener("selectionchange", this.handleSelectionChange);
        root.addEventListener("pointerup", this.handlePointerUp, true);
        root.addEventListener("keyup", this.handleKeyUp, true);
        root.addEventListener("touchend", this.handlePointerUp, true);

        this.refresh();
    }

    private bindViewportListeners() {
        const viewport = globalThis.visualViewport;
        if (!viewport) {
            this.toolbar?.style.removeProperty("--mobile-toolbar-bottom-offset");
            return;
        }

        const handler = () => this.updateViewportOffset();
        viewport.addEventListener("resize", handler);
        viewport.addEventListener("scroll", handler);

        this.updateViewportOffset();
    }

    private refresh() {
        if (!this.toolbar || !this.controller) return;
        const hasActiveSelection = this.contentArea
            ? hasSelection(this.contentArea)
            : hasSelection();
        this.controller.update(hasActiveSelection);
    }

    private buildFormattingButtons(): MobileToolbarButton[] {
        return [
            {
                id: "bold",
                icon: () => <icons.BoldIcon />,
                label: t("bold"),
                onClick: () => runCommand("toggleBold"),
                isActive: () => runCommand("stateBold"),
            },
            {
                id: "italic",
                icon: () => <icons.ItalicIcon />,
                label: t("italic"),
                onClick: () => runCommand("toggleItalic"),
                isActive: () => runCommand("stateItalic"),
            },
            {
                id: "underline",
                icon: () => <icons.UnderlineIcon />,
                label: t("underline"),
                onClick: () => runCommand("toggleUnderline"),
                isActive: () => runCommand("stateUnderline"),
            },
            {
                id: "strikethrough",
                icon: () => <icons.StrikeThroughIcon />,
                label: t("strikethrough"),
                onClick: () => runCommand("toggleStrike"),
                isActive: () => runCommand("stateStrike"),
            },
        ];
    }
}