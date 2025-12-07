import { focusOnElement } from "../../index.ts";
import type { CommandContext } from "../../index.ts";

function findClosestTable(node: Node | null | undefined): HTMLTableElement | null {
    let current: Node | null | undefined = node;

    while (current) {
        if (current instanceof HTMLTableElement && current.closest(".table-block")) {
            return current;
        }

        if (current instanceof Element) {
            const table = current.closest<HTMLTableElement>(".table-block table");
            if (table) return table;

            const block = current.closest<HTMLElement>(".table-block");
            const descendantTable = block?.querySelector<HTMLTableElement>("table");
            if (descendantTable) return descendantTable;
        }

        current = current.parentNode;
    }

    return null;
}

function findClosestCell(node: Node | null | undefined): HTMLTableCellElement | null {
    let current: Node | null | undefined = node;

    while (current) {
        if (current instanceof HTMLTableCellElement) return current;

        if (current instanceof Element) {
            const cell = current.closest<HTMLTableCellElement>("td,th");
            if (cell) return cell;
        }

        current = current.parentNode;
    }

    return null;
}

export function findTableFromSelection(selection?: Selection | null): HTMLTableElement | null {
    const sel = selection ?? globalThis.getSelection?.() ?? null;
    if (!sel) return null;

    return findClosestTable(sel.anchorNode) || findClosestTable(sel.focusNode);
}

export function resolveTableFromContext(context?: CommandContext): HTMLTableElement | null {
    const tableFromContent = extractTableFromContent(context);
    if (tableFromContent) return tableFromContent;

    const selection = context?.selection ?? globalThis.getSelection?.() ?? null;
    const candidates: Array<Node | null | undefined> = [
        context?.event?.target as Node | null,
        context?.target as Node | null,
        selection?.anchorNode,
        selection?.focusNode,
        globalThis.document?.activeElement ?? null,
    ];

    for (const node of candidates) {
        const table = findClosestTable(node);
        if (table) return table;
    }

    return null;
}

function resolveCellFromContext(
    context?: CommandContext,
    table?: HTMLTableElement | null,
): HTMLTableCellElement | null {
    const content = context?.content;
    if (content instanceof HTMLTableCellElement) return content;

    const candidates: Array<Node | null | undefined> = [
        context?.event?.target as Node | null,
        context?.target as Node | null,
        context?.selection?.anchorNode,
        context?.selection?.focusNode,
        globalThis.document?.activeElement ?? null,
    ];

    for (const node of candidates) {
        const cell = findClosestCell(node);
        if (cell && (!table || cell.closest("table") === table)) return cell;
    }

    return null;
}

function extractTableFromContent(context?: CommandContext): HTMLTableElement | null {
    const content = context?.content;

    if (!content) return null;
    if (content instanceof HTMLTableElement) return content;

    const maybeTable = (content as { table?: unknown })?.table;
    if (maybeTable instanceof HTMLTableElement) return maybeTable;

    return null;
}

export function addRowToTable(table: HTMLTableElement): boolean {
    const tbody = table.tBodies[0] ?? table.createTBody();
    const referenceRow = tbody.rows[tbody.rows.length - 1] ?? table.querySelector("tr");
    const columnCount = referenceRow?.cells.length ?? 0;
    if (!columnCount) return false;

    const newRow = document.createElement("tr");
    for (let index = 0; index < columnCount; index++) {
        const templateCell = referenceRow?.cells[index] ?? referenceRow?.cells[referenceRow.cells.length - 1];
        newRow.append(createCellLike(templateCell as HTMLTableCellElement | undefined));
    }

    tbody.append(newRow);
    const firstCell = newRow.cells[0];
    if (firstCell) {
        focusOnElement(firstCell as HTMLElement);
    }

    return true;
}

export function addColumnToTable(table: HTMLTableElement): boolean {
    const rows = Array.from(table.querySelectorAll<HTMLTableRowElement>("tr"));
    if (!rows.length) return false;

    const newColumnIndex = rows[0].cells.length;

    for (const row of rows) {
        const templateCell = row.cells[row.cells.length - 1] ?? row.cells[0];
        row.append(createCellLike(templateCell));
    }

    const firstNewCell = rows[0].cells[newColumnIndex];
    if (firstNewCell) {
        focusOnElement(firstNewCell as HTMLElement);
    }

    return true;
}

export function deleteRowFromTable(
    table: HTMLTableElement,
    context?: CommandContext,
): boolean {
    const targetCell = resolveCellFromContext(context, table);
    const targetRow = targetCell?.closest<HTMLTableRowElement>("tr");
    if (!targetRow) return false;

    const allRows = Array.from(table.querySelectorAll<HTMLTableRowElement>("tr"));
    if (allRows.length <= 1) return false;

    const rowIndex = allRows.indexOf(targetRow);
    if (rowIndex === -1) return false;

    const focusRow = allRows[rowIndex + 1] ?? allRows[rowIndex - 1];

    targetRow.remove();

    const focusCell = focusRow?.cells[Math.min(targetCell?.cellIndex ?? 0, Math.max(0, focusRow.cells.length - 1))]
        ?? focusRow?.cells[0];

    if (focusCell) {
        focusOnElement(focusCell as HTMLElement);
    }

    return true;
}

export function deleteColumnFromTable(
    table: HTMLTableElement,
    context?: CommandContext,
): boolean {
    const targetCell = resolveCellFromContext(context, table);
    if (!targetCell) return false;

    const targetColumnIndex = targetCell.cellIndex;
    const rows = Array.from(table.querySelectorAll<HTMLTableRowElement>("tr"));
    const columnCount = rows[0]?.cells.length ?? 0;
    if (!columnCount || columnCount <= 1) return false;

    for (const row of rows) {
        const cell = row.cells[targetColumnIndex];
        cell?.remove();
    }

    const focusRow = targetCell.closest<HTMLTableRowElement>("tr");
    const fallbackRow = rows.find((row) => row.cells.length > 0);
    const focusCell = focusRow?.cells[Math.min(targetColumnIndex, Math.max(0, (focusRow.cells.length - 1)))]
        ?? fallbackRow?.cells[0];

    if (focusCell) {
        focusOnElement(focusCell as HTMLElement);
    }

    return true;
}

function createCellLike(template?: HTMLTableCellElement): HTMLTableCellElement {
    const tag = template?.tagName?.toLowerCase() === "th" ? "th" : "td";
    const cell = document.createElement(tag) as HTMLTableCellElement;
    cell.contentEditable = "true";
    cell.append(document.createElement("br"));
    return cell;
}