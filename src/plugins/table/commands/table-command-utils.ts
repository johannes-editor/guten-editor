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

function createCellLike(template?: HTMLTableCellElement): HTMLTableCellElement {
    const tag = template?.tagName?.toLowerCase() === "th" ? "th" : "td";
    const cell = document.createElement(tag) as HTMLTableCellElement;
    cell.contentEditable = "true";
    cell.append(document.createElement("br"));
    return cell;
}