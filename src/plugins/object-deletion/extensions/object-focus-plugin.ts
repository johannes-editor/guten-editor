import { Plugin } from "@core/plugin-engine";
import { runCommand } from "@core/command";
import * as deletion from "../object-deletion-utils.ts";
import { EventTypes } from "@utils/dom";
import { KeyboardKeys } from "@utils/keyboard";

const OBJECT_FOCUS_STYLE_ID = "guten-object-focus-styles";

const OBJECT_FOCUS_STYLES = /*css*/`
    .guten-focusable-object {
        transition: box-shadow 120ms ease, outline-color 120ms ease;
    }

    .guten-focusable-object.guten-focused-object {
        outline: 2px solid var(--accent-primary);
        outline-offset: 2px;
        border-radius: var(--radius-sm);
    }
`;

export class ObjectFocusPlugin extends Plugin {
    private contentArea: HTMLElement | null = null;
    private observer: MutationObserver | null = null;

    override setup(root: HTMLElement): void {
        this.contentArea = root.querySelector<HTMLElement>("#contentArea") ?? root.querySelector<HTMLElement>("[contenteditable='true']");
        if (!this.contentArea) return;

        this.ensureStyles();
        deletion.decorateFocusableObjects(this.contentArea);

        this.contentArea.addEventListener(EventTypes.Click, this.handleClick, true);
        this.contentArea.addEventListener(EventTypes.KeyDown, this.handleKeyDown, true);

        this.contentArea.addEventListener(EventTypes.FocusIn, this.handleFocusIn, true);
        this.contentArea.addEventListener(EventTypes.FocusOut, this.handleFocusOut, true);

        globalThis.addEventListener(EventTypes.Blur, this.handleWindowBlur);

        this.observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const addedNode of Array.from(mutation.addedNodes)) {
                    if (!(addedNode instanceof HTMLElement)) continue;
                    deletion.decorateFocusableObjects(addedNode);
                }
            }
        });

        this.observer.observe(this.contentArea, { childList: true, subtree: true });
    }

    teardown(): void {
        if (this.contentArea) {
            this.contentArea.removeEventListener(EventTypes.Click, this.handleClick, true);
            this.contentArea.removeEventListener(EventTypes.KeyDown, this.handleKeyDown, true);
            this.contentArea.removeEventListener(EventTypes.FocusIn, this.handleFocusIn, true);
            this.contentArea.removeEventListener(EventTypes.FocusOut, this.handleFocusOut, true);
        }

        globalThis.removeEventListener(EventTypes.Blur, this.handleWindowBlur);

        this.observer?.disconnect();
        this.observer = null;
        this.contentArea = null;
    }

    private ensureStyles(): void {
        if (document.getElementById(OBJECT_FOCUS_STYLE_ID)) return;
        const style = document.createElement("style");
        style.id = OBJECT_FOCUS_STYLE_ID;
        style.textContent = OBJECT_FOCUS_STYLES;
        document.head.appendChild(style);
    }

    private readonly handleClick = (event: MouseEvent) => {
        const object = deletion.findFocusableObjectFromNode(event.target as Node | null);
        if (!object) {
            deletion.clearFocusedObject();
            return;
        }

        if (event.detail >= 3) {
            event.preventDefault();
            event.stopPropagation();
            deletion.clearFocusedObject();

            const block = object.closest<HTMLElement>(".block");
            if (block) {
                deletion.focusBlockElement(block);
            }
            return;
        }

        if (event.detail === 1) {
            deletion.setFocusedObject(object);
            return;
        }

        if (event.detail === 2) {
            event.preventDefault();
            event.stopPropagation();
            deletion.setFocusedObject(object);
            deletion.openEditorForObject(object);
        }
    };

    private readonly handleFocusIn = (event: FocusEvent) => {
        const object = deletion.findFocusableObjectFromNode(event.target as Node | null);
        if (!object) {
            deletion.clearFocusedObject();
            return;
        }

        deletion.setFocusedObjectState(object);
    };

    private readonly handleFocusOut = () => {
        const activeElement = document.activeElement;
        if (!(activeElement instanceof HTMLElement)) {
            deletion.clearFocusedObject();
            return;
        }

        const activeObject = deletion.findFocusableObjectFromNode(activeElement);
        if (!activeObject) {
            deletion.clearFocusedObject();
            return;
        }

        deletion.setFocusedObjectState(activeObject);
    };

    private readonly handleWindowBlur = () => {
        deletion.clearFocusedObject();
    };

    private readonly handleKeyDown = (event: KeyboardEvent) => {
        if (event.defaultPrevented) return;
        if (event.key !== KeyboardKeys.Backspace && event.key !== KeyboardKeys.Delete) return;

        const active = deletion.getFocusedObject();
        if (!active) return;

        if (event.key === KeyboardKeys.Backspace || event.key === KeyboardKeys.Delete) {
            event.preventDefault();
            event.stopPropagation();
            runCommand("deleteFocusedObject", { event });
            return;
        }

        if (event.key === KeyboardKeys.Enter) {
            event.preventDefault();
            event.stopPropagation();
            deletion.openEditorForObject(active);
        }
    };
}