/** @jsx h */

import { appendElementOnRootArea } from "../../components/editor/index.tsx";
import { h, hasSelection, icons, keyboard, ExtensiblePlugin, Plugin, PluginExtension, runCommand, t } from "../index.ts";
import { MobileToolbar, MobileToolbarButton } from "./components/mobile-toolbar.tsx";

export type MobileToolbarMode = "default" | "selection";

export interface MobileToolbarExtensionContext {
    mode: MobileToolbarMode;
    selection: Selection | null;
    contentArea: HTMLElement | null;
}

class MobileToolbarController {

    constructor(
        private readonly toolbar: MobileToolbar,
        private readonly resolveButtons: (mode: MobileToolbarMode) => MobileToolbarButton[],
    ) {}

    private mode: MobileToolbarMode = "default";

    update(selectionActive: boolean) {
        const nextMode: MobileToolbarMode = selectionActive ? "selection" : "default";
        this.mode = nextMode;
        const buttons = this.resolveButtons(nextMode);
        this.toolbar.setButtons(buttons);

        if (selectionActive && nextMode === "selection") {
            this.toolbar.refreshActiveStates();
        }

        this.toolbar.setVisible(true);
    }

    forceRefresh(): void {
        const buttons = this.resolveButtons(this.mode);
        this.toolbar.setButtons(buttons);
        this.toolbar.setVisible(true);
    }
}

export class MobileToolbarPlugin extends ExtensiblePlugin<MobileToolbarButtonExtensionPlugin> {

    private toolbar: MobileToolbar | null = null;
    private controller: MobileToolbarController | null = null;
    private contentArea: HTMLElement | null = null;
    private extensionPlugins: MobileToolbarButtonExtensionPlugin[] = [];
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
        this.controller = new MobileToolbarController(
            toolbar,
            (mode) => this.buildButtonsForMode(mode),
        );

        this.bindViewportListeners();

        document.addEventListener("selectionchange", this.handleSelectionChange);
        root.addEventListener("pointerup", this.handlePointerUp, true);
        root.addEventListener("keyup", this.handleKeyUp, true);
        root.addEventListener("touchend", this.handlePointerUp, true);

        this.refresh();
    }

    override attachExtensions(extensions: MobileToolbarButtonExtensionPlugin[]): void {
        this.extensionPlugins = extensions ?? [];
        this.controller?.forceRefresh();
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

    private buildButtonsForMode(mode: MobileToolbarMode): MobileToolbarButton[] {
        const context: MobileToolbarExtensionContext = {
            mode,
            selection: globalThis.getSelection?.() ?? null,
            contentArea: this.contentArea,
        };

        const baseButtons = mode === "selection"
            ? this.buildFormattingButtons()
            : this.defaultButtons(context);

        const extensionButtons = this.collectExtensionButtons(context);

        return [...baseButtons, ...extensionButtons].sort(
            (a, b) => (a.sort ?? 0) - (b.sort ?? 0),
        );
    }

    private collectExtensionButtons(context: MobileToolbarExtensionContext): MobileToolbarButton[] {
        const buttons: MobileToolbarButton[] = [];

        for (const extension of this.extensionPlugins) {
            try {
                const entries = extension.buttons?.(context);
                if (!entries) continue;
                buttons.push(...(Array.isArray(entries) ? entries : [entries]));
            } catch (error) {
                console.warn(
                    `[MobileToolbarPlugin] Failed to load buttons from ${extension.constructor.name}:`,
                    error,
                );
            }
        }

        return buttons;
    }

    private defaultButtons(context: MobileToolbarExtensionContext): MobileToolbarButton[] {
        return [
            {
                id: "slash-menu",
                icon: () => <icons.SlashCommandIcon />,
                label: t("open_slash_menu"),
                onClick: () => this.dispatchSlashShortcut(),
                sort: 10,
            },
            {
                id: "undo",
                icon: () => <icons.UndoIcon />,
                label: t("undo"),
                onClick: () => runCommand("editor.undo"),
                sort: 15,
            },
            {
                id: "redo",
                icon: () => <icons.RedoIcon />,
                label: t("redo"),
                onClick: () => runCommand("editor.redo"),
                sort: 16,
            },
            {
                id: "move-up",
                icon: () => <icons.ArrowUpIcon />,
                label: t("move_up"),
                onClick: () => runCommand("moveBlockUp", { selection: context.selection ?? undefined }),
                sort: 20,
            },
            {
                id: "move-down",
                icon: () => <icons.ArrowDownIcon />,
                label: t("move_down"),
                onClick: () => runCommand("moveBlockDown", { selection: context.selection ?? undefined }),
                sort: 30,
            },
            {
                id: "delete-block",
                icon: () => <icons.TrashIcon />,
                label: t("delete"),
                onClick: () => runCommand("deleteBlock", { selection: context.selection ?? undefined }),
                sort: 40,
            },
        ];
    }

    private buildFormattingButtons(): MobileToolbarButton[] {
        return [
            {
                id: "bold",
                icon: () => <icons.BoldIcon />,
                label: t("bold"),
                onClick: () => runCommand("toggleBold"),
                isActive: () => runCommand("stateBold"),
                sort: 10,
            },
            {
                id: "italic",
                icon: () => <icons.ItalicIcon />,
                label: t("italic"),
                onClick: () => runCommand("toggleItalic"),
                isActive: () => runCommand("stateItalic"),
                sort: 20,
            },
            {
                id: "underline",
                icon: () => <icons.UnderlineIcon />,
                label: t("underline"),
                onClick: () => runCommand("toggleUnderline"),
                isActive: () => runCommand("stateUnderline"),
                sort: 30,
            },
            {
                id: "strikethrough",
                icon: () => <icons.StrikeThroughIcon />,
                label: t("strikethrough"),
                onClick: () => runCommand("toggleStrike"),
                isActive: () => runCommand("stateStrike"),
                sort: 40,
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
}

export abstract class MobileToolbarButtonExtensionPlugin extends PluginExtension<MobileToolbarPlugin> {

    override readonly target = MobileToolbarPlugin;

    abstract buttons(context: MobileToolbarExtensionContext): MobileToolbarButton | MobileToolbarButton[] | null | undefined;
}