import { Plugin } from "@core/plugin-engine";
import { runCommand } from "@core/command";
import {
    clearFocusedObject,
    decorateFocusableObjects,
    findFocusableObjectFromNode,
    focusBlockElement,
    getFocusedObject,
    setFocusedObject,
} from "../object-deletion-utils.ts";

const OBJECT_FOCUS_STYLE_ID = "guten-object-focus-styles";

const OBJECT_FOCUS_STYLES = /*css*/`
    .guten-focusable-object {
        transition: box-shadow 120ms ease, outline-color 120ms ease;
    }

    .guten-focusable-object.guten-focused-object {
        outline: 2px solid var(--accent-primary);
        outline-offset: 2px;
        box-shadow: 0 0 0 3px color-mix(in oklab, var(--accent-primary) 28%, transparent);
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
        decorateFocusableObjects(this.contentArea);

        this.contentArea.addEventListener("click", this.handleClick, true);
        this.contentArea.addEventListener("keydown", this.handleKeyDown, true);

        this.observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const addedNode of Array.from(mutation.addedNodes)) {
                    if (!(addedNode instanceof HTMLElement)) continue;
                    decorateFocusableObjects(addedNode);
                }
            }
        });

        this.observer.observe(this.contentArea, { childList: true, subtree: true });
    }

    teardown(): void {
        if (this.contentArea) {
            this.contentArea.removeEventListener("click", this.handleClick, true);
            this.contentArea.removeEventListener("keydown", this.handleKeyDown, true);
        }

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
        const object = findFocusableObjectFromNode(event.target as Node | null);
        if (!object) {
            clearFocusedObject();
            return;
        }

        if (event.detail >= 3) {
            event.preventDefault();
            event.stopPropagation();
            clearFocusedObject();

            const block = object.closest<HTMLElement>(".block");
            if (block) {
                focusBlockElement(block);
            }
            return;
        }

        if (event.detail === 2) {
            event.preventDefault();
            event.stopPropagation();
            setFocusedObject(object);
        }
    };

    private readonly handleKeyDown = (event: KeyboardEvent) => {
        if (event.defaultPrevented) return;
        if (event.key !== "Backspace" && event.key !== "Delete") return;

        const active = getFocusedObject();
        if (!active) return;

        event.preventDefault();
        event.stopPropagation();
        runCommand("deleteFocusedObject", { event });
    };
}