import { focusOnElement } from "@utils/dom";
import type { CommandContext } from "@core/command";

export function findRowIndexFromSelection(
    table: HTMLTableElement,
    selection?: Selection | null,
): number | null {
    const sel = selection ?? globalThis.getSelection?.() ?? null;
    if (!sel) return null;

    const cell = findClosestCell(sel.anchorNode) ?? findClosestCell(sel.focusNode);
    if (!cell || cell.closest("table") !== table) return null;

    const row = cell.closest<HTMLTableRowElement>("tr");
    if (!row) return null;

    const rows = Array.from(table.querySelectorAll<HTMLTableRowElement>("tr"));
    const rowIndex = rows.indexOf(row);
    return rowIndex >= 0 ? rowIndex : null;
}

export function findColumnIndexFromSelection(
    table: HTMLTableElement,
    selection?: Selection | null,
): number | null {
    const sel = selection ?? globalThis.getSelection?.() ?? null;
    if (!sel) return null;

    const cell = findClosestCell(sel.anchorNode) ?? findClosestCell(sel.focusNode);
    if (!cell || cell.closest("table") !== table) return null;

    return cell.cellIndex >= 0 ? cell.cellIndex : null;
}

function extractRowIndexFromContent(context?: CommandContext): number | null {
    const rowIndex = (context?.content as { rowIndex?: unknown } | undefined)?.rowIndex;
    return typeof rowIndex === "number" && Number.isInteger(rowIndex) ? rowIndex : null;
}

function extractColumnIndexFromContent(context?: CommandContext): number | null {
    const columnIndex = (context?.content as { columnIndex?: unknown } | undefined)?.columnIndex;
    return typeof columnIndex === "number" && Number.isInteger(columnIndex) ? columnIndex : null;
}

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

export function addRowRelativeToTable(
    table: HTMLTableElement,
    context: CommandContext | undefined,
    position: "above" | "below",
): boolean {
    const allRows = Array.from(table.querySelectorAll<HTMLTableRowElement>("tr"));
    const targetRow = resolveTargetRow(table, context, allRows);
    const referenceRow = targetRow ?? allRows[allRows.length - 1];
    const columnCount = referenceRow?.cells.length ?? 0;
    if (!columnCount || !referenceRow) return false;

    const newRow = document.createElement("tr");
    for (let index = 0; index < columnCount; index++) {
        const templateCell = referenceRow.cells[index] ?? referenceRow.cells[referenceRow.cells.length - 1];
        newRow.append(createCellLike(templateCell));
    }

    if (position === "above") {
        referenceRow.before(newRow);
    } else {
        referenceRow.after(newRow);
    }

    return true;
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

    return true;
}

export function addColumnToTable(table: HTMLTableElement): boolean {
    const rows = Array.from(table.querySelectorAll<HTMLTableRowElement>("tr"));
    if (!rows.length) return false;


    for (const row of rows) {
        const templateCell = row.cells[row.cells.length - 1] ?? row.cells[0];
        row.append(createCellLike(templateCell));
    }

    return true;
}

export function addColumnRelativeToTable(
    table: HTMLTableElement,
    context: CommandContext | undefined,
    position: "left" | "right",
): boolean {
    const rows = Array.from(table.querySelectorAll<HTMLTableRowElement>("tr"));
    if (!rows.length) return false;

    const targetColumnIndex = resolveTargetColumnIndex(table, context, rows);
    if (targetColumnIndex === null) return false;

    for (const row of rows) {
        const referenceCell = row.cells[targetColumnIndex];
        const templateCell = referenceCell ?? row.cells[row.cells.length - 1] ?? row.cells[0];
        const newCell = createCellLike(templateCell);

        if (!referenceCell || position === "right") {
            referenceCell?.after(newCell);
            if (!referenceCell) row.append(newCell);
            continue;
        }

        referenceCell.before(newCell);
    }

    return true;
}

export function deleteRowFromTable(
    table: HTMLTableElement,
    context?: CommandContext,
): boolean {
    const allRows = Array.from(table.querySelectorAll<HTMLTableRowElement>("tr"));
    const targetRow = resolveTargetRow(table, context, allRows);
    if (!targetRow) return false;
    if (allRows.length <= 1) return false;

    const rowIndex = allRows.indexOf(targetRow);
    if (rowIndex === -1) return false;

    targetRow.remove();

    return true;
}

export function deleteColumnFromTable(
    table: HTMLTableElement,
    context?: CommandContext,
): boolean {
    const rows = Array.from(table.querySelectorAll<HTMLTableRowElement>("tr"));
    const targetColumnIndex = resolveTargetColumnIndex(table, context, rows);
    if (targetColumnIndex === null) return false;

    const columnCount = rows[0]?.cells.length ?? 0;
    if (!columnCount || columnCount <= 1) return false;

    const targetCell = rows.find((row) => row.cells[targetColumnIndex])?.cells[targetColumnIndex] ?? null;

    for (const row of rows) {
        const cell = row.cells[targetColumnIndex];
        cell?.remove();
    }

    const focusRow = targetCell?.closest<HTMLTableRowElement>("tr");
    const fallbackRow = rows.find((row) => row.cells.length > 0);
    const focusCell = focusRow?.cells[Math.min(targetColumnIndex, Math.max(0, (focusRow.cells.length - 1)))]
        ?? fallbackRow?.cells[0];

    if (focusCell) {
        focusOnElement(focusCell as HTMLElement);
    }

    return true;
}

export function moveRowOnTable(
    table: HTMLTableElement,
    context: CommandContext | undefined,
    direction: "up" | "down",
): boolean {
    const allRows = Array.from(table.querySelectorAll<HTMLTableRowElement>("tr"));
    const targetRow = resolveTargetRow(table, context, allRows);
    if (!targetRow) return false;

    if (direction === "up") {
        const previousRow = targetRow.previousElementSibling;
        if (!(previousRow instanceof HTMLTableRowElement)) return false;
        previousRow.before(targetRow);
    } else {
        const nextRow = targetRow.nextElementSibling;
        if (!(nextRow instanceof HTMLTableRowElement)) return false;
        nextRow.after(targetRow);
    }

    return true;
}

export function moveColumnOnTable(
    table: HTMLTableElement,
    context: CommandContext | undefined,
    direction: "left" | "right",
): boolean {
    const rows = Array.from(table.querySelectorAll<HTMLTableRowElement>("tr"));
    if (!rows.length) return false;

    const targetColumnIndex = resolveTargetColumnIndex(table, context, rows);
    if (targetColumnIndex === null) return false;

    const firstRow = rows[0];
    const columnCount = firstRow?.cells.length ?? 0;

    if (direction === "left" && targetColumnIndex <= 0) return false;
    if (direction === "right" && targetColumnIndex >= columnCount - 1) return false;

    for (const row of rows) {
        const targetCell = row.cells[targetColumnIndex];
        if (!targetCell) continue;

        if (direction === "left") {
            const previousCell = targetCell.previousElementSibling;
            if (!(previousCell instanceof HTMLTableCellElement)) return false;
            previousCell.before(targetCell);
        } else {
            const nextCell = targetCell.nextElementSibling;
            if (!(nextCell instanceof HTMLTableCellElement)) return false;
            nextCell.after(targetCell);
        }
    }

    return true;
}

function resolveTargetRow(
    table: HTMLTableElement,
    context: CommandContext | undefined,
    allRows: HTMLTableRowElement[],
): HTMLTableRowElement | null {
    const targetCell = resolveCellFromContext(context, table);
    const targetRow = targetCell?.closest<HTMLTableRowElement>("tr");
    if (targetRow) return targetRow;

    const rowIndex = extractRowIndexFromContent(context);
    if (rowIndex !== null) {
        return allRows[rowIndex] ?? null;
    }

    return allRows[0] ?? null;
}

function resolveTargetColumnIndex(
    table: HTMLTableElement,
    context: CommandContext | undefined,
    rows: HTMLTableRowElement[],
): number | null {
    const targetCell = resolveCellFromContext(context, table);
    if (targetCell) return targetCell.cellIndex;

    const columnIndex = extractColumnIndexFromContent(context);
    if (columnIndex !== null) return columnIndex;

    return rows[0]?.cells.length ? 0 : null;
}


function createCellLike(template?: HTMLTableCellElement): HTMLTableCellElement {
    const tag = template?.tagName?.toLowerCase() === "th" ? "th" : "td";
    const cell = document.createElement(tag) as HTMLTableCellElement;
    cell.contentEditable = "true";
    cell.append(document.createElement("br"));
    return cell;
}