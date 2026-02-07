import { Plugin } from "@core/plugin-engine/plugin.ts";
import { focusOnElement } from "@utils/dom/index.ts";

type Direction = "left" | "right" | "up" | "down";

export class TableNavigationPlugin extends Plugin {

    private contentArea: HTMLElement | null = null;

    override setup(root: HTMLElement): void {
        const contentArea = root.querySelector<HTMLElement>("#contentArea");
        if (!contentArea) {
            console.warn("[TableNavigationPlugin] Unable to find #contentArea in editor root.");
            return;
        }

        this.contentArea = contentArea;
        contentArea.addEventListener("keydown", this.handleKeyDown, true);
        contentArea.addEventListener("focusin", this.handleFocusIn, true);
        this.ensureEditableCells(contentArea);
    }

    teardown(): void {
        this.contentArea?.removeEventListener("keydown", this.handleKeyDown, true);
        this.contentArea?.removeEventListener("focusin", this.handleFocusIn, true);
        this.contentArea = null;
    }

    private readonly handleKeyDown = (event: KeyboardEvent) => {
        if (!this.contentArea) return;
        if (event.defaultPrevented) return;
        if (event.isComposing) return;

        const key = event.key;
        if (key !== "ArrowLeft" && key !== "ArrowRight" && key !== "ArrowUp" && key !== "ArrowDown") return;
        if (event.shiftKey || event.altKey || event.metaKey || event.ctrlKey) return;

        const selection = this.contentArea.ownerDocument?.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        if (!selection.isCollapsed) return;

        const range = selection.getRangeAt(0);
        const cell = this.findClosestCell(range.startContainer);
        if (!cell) return;
        if (!this.isPluginTableCell(cell)) return;

        let target: HTMLTableCellElement | null = null;

        switch (key) {
            case "ArrowLeft":
                if (!this.isAtCellBoundary(range, cell, "start")) return;
                target = this.findTargetCell(cell, "left");
                break;
            case "ArrowRight":
                if (!this.isAtCellBoundary(range, cell, "end")) return;
                target = this.findTargetCell(cell, "right");
                break;
            case "ArrowUp":
                if (!this.isAtCellBoundary(range, cell, "start")) return;
                target = this.findTargetCell(cell, "up");
                break;
            case "ArrowDown":
                if (!this.isAtCellBoundary(range, cell, "end")) return;
                target = this.findTargetCell(cell, "down");
                break;
        }

        if (!target) return;

        event.preventDefault();
        event.stopPropagation();
        this.focusCell(target);
    };

    private focusCell(cell: HTMLTableCellElement) {
        if (cell.contentEditable !== "true") {
            cell.contentEditable = "true";
        }
        focusOnElement(cell);
    }

    private readonly handleFocusIn = (event: FocusEvent) => {
        const target = event.target as Node | null;
        const cell = this.findClosestCell(target);
        if (!cell) return;
        if (!this.isPluginTableCell(cell)) return;
        if (cell.contentEditable !== "true") {
            cell.contentEditable = "true";
        }
    };

    private ensureEditableCells(root: ParentNode) {
        root.querySelectorAll<HTMLTableCellElement>(".table-block td, .table-block th")
            .forEach(cell => {
                if (cell.contentEditable !== "true") {
                    cell.contentEditable = "true";
                }
            });
    }

    private findClosestCell(node: Node | null): HTMLTableCellElement | null {
        while (node) {
            if (node instanceof HTMLTableCellElement) {
                return node;
            }
            node = node.parentNode;
        }
        return null;
    }

    private isPluginTableCell(cell: HTMLTableCellElement): boolean {
        return Boolean(cell.closest(".table-block"));
    }

    private isAtCellBoundary(range: Range, cell: HTMLTableCellElement, boundary: "start" | "end"): boolean {
        const compare = range.cloneRange();
        compare.selectNodeContents(cell);

        if (boundary === "start") {
            compare.collapse(true);
            return range.compareBoundaryPoints(Range.START_TO_START, compare) === 0;
        }

        compare.collapse(false);
        return range.compareBoundaryPoints(Range.END_TO_END, compare) === 0;
    }

    private findTargetCell(cell: HTMLTableCellElement, direction: Direction): HTMLTableCellElement | null {
        const row = cell.parentElement as HTMLTableRowElement | null;
        if (!row) return null;

        const table = row.closest("table");
        if (!table) return null;

        const cells = Array.from(row.querySelectorAll<HTMLTableCellElement>("td, th"));
        const currentIndex = cells.indexOf(cell);
        if (currentIndex === -1) return null;

        switch (direction) {
            case "left": {
                if (currentIndex > 0) {
                    return cells[currentIndex - 1];
                }
                const previousRow = this.findSiblingRow(row, -1);
                if (!previousRow) return null;
                const previousCells = Array.from(previousRow.querySelectorAll<HTMLTableCellElement>("td, th"));
                return previousCells.at(-1) ?? null;
            }
            case "right": {
                if (currentIndex < cells.length - 1) {
                    return cells[currentIndex + 1];
                }
                const nextRow = this.findSiblingRow(row, 1);
                if (!nextRow) return null;
                const nextCells = Array.from(nextRow.querySelectorAll<HTMLTableCellElement>("td, th"));
                return nextCells[0] ?? null;
            }
            case "up": {
                const previousRow = this.findSiblingRow(row, -1);
                if (!previousRow) return null;
                const previousCells = Array.from(previousRow.querySelectorAll<HTMLTableCellElement>("td, th"));
                const index = Math.min(currentIndex, previousCells.length - 1);
                return previousCells[index] ?? null;
            }
            case "down": {
                const nextRow = this.findSiblingRow(row, 1);
                if (!nextRow) return null;
                const nextCells = Array.from(nextRow.querySelectorAll<HTMLTableCellElement>("td, th"));
                const index = Math.min(currentIndex, nextCells.length - 1);
                return nextCells[index] ?? null;
            }
        }

        return null;
    }

    private findSiblingRow(row: HTMLTableRowElement, delta: 1 | -1): HTMLTableRowElement | null {
        let sibling: Element | null = row;
        while (sibling) {
            sibling = delta === 1 ? sibling.nextElementSibling : sibling.previousElementSibling;
            if (!sibling) return null;
            if (sibling instanceof HTMLTableRowElement) {
                return sibling;
            }
        }
        return null;
    }
}