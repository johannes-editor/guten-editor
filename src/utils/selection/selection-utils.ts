export class SelectionUtils {
    static getCurrentSelectionRange(): Range | null {
        const getSelection = typeof globalThis.getSelection === "function"
            ? globalThis.getSelection
            : null;

        if (!getSelection) return null;

        const selection = getSelection();
        if (selection && selection.rangeCount > 0) {
            return selection.getRangeAt(0).cloneRange();
        }
        return null;
    }
}

export function hasSelection(): boolean {
    const selection = globalThis.getSelection();
    return (selection && selection.rangeCount > 0 && selection.toString().trim() !== "") ?? false;
}

export function clearSelection(): void {
    const sel = globalThis.getSelection();

    if (sel) {
        sel.removeAllRanges();
    }
}