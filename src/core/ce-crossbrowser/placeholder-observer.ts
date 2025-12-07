import { findClosestBlockBySelection } from "../../utils/selection/selection-utils.ts";


export class PlaceholderObserver {
    private observer: MutationObserver | null = null;

    private selectionChangeHandler = () => this.updateCaretState();

    constructor(private target: HTMLElement) { }

    public start() {
        this.stop();

        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "childList" || mutation.type === "characterData") {
                    this.updateEmptyClass();
                }
            });
        });

        this.observer.observe(this.target, {
            childList: true,
            subtree: true,
            characterData: true
        });

        this.target.ownerDocument.addEventListener("selectionchange", this.selectionChangeHandler);

        this.updateEmptyClass();
        this.updateCaretState();
    }

    public stop() {
        this.observer?.disconnect();
        this.observer = null;

        this.target.ownerDocument.removeEventListener("selectionchange", this.selectionChangeHandler);
    }

    private updateEmptyClass() {
        document.querySelectorAll<HTMLElement>('.placeholder').forEach((element) => {
            const text = element.textContent?.replace(/\u00A0/g, '').trim() ?? '';
            if (text === '') {
                element.classList.add('empty');
            } else {
                element.classList.remove('empty');
            }
        });
    }

    private updateCaretState() {
        const placeholders = this.target.ownerDocument.querySelectorAll<HTMLElement>('p.placeholder');
        placeholders.forEach((element) => element.classList.remove('has-caret'));

        const selection = this.target.ownerDocument.getSelection?.();
        if (!selection || selection.rangeCount === 0) return;

        const currentBlock = findClosestBlockBySelection(selection);
        if (currentBlock?.matches('p.placeholder')) {
            currentBlock.classList.add('has-caret');
        }
    }
}
