/** @jsx h */

import { h, DefaultProps, focusOnElement } from "../../index.ts";

export function TableBlock({ children, className = "", ...props }: DefaultProps) {
    const blockClass = ["block", "table-block", className].filter(Boolean).join(" ");
    const content = children ?? (
        <table>
            <tbody>
                <tr>
                    <td contentEditable="true"><br /></td>
                    <td contentEditable="true"><br /></td>
                </tr>
                <tr>
                    <td contentEditable="true"><br /></td>
                    <td contentEditable="true"><br /></td>
                </tr>
            </tbody>
        </table>
    );

    return (
        <div
            className={blockClass}
            contentEditable="false"
            {...props}
        >
            {content}

            <div className="table-add-row-area">
                <button type="button" className="table-add-row" onClick={handleAddRow}>
                    +
                </button>
            </div>
            <div className="table-add-column-area">
                <button type="button" className="table-add-column" onClick={handleAddColumn}>
                    +
                </button>
            </div>
        </div>
    );
}

function handleAddRow(event: Event) {

    console.log("handleAddRow");
    const container = (event.currentTarget as HTMLElement | null)?.closest<HTMLElement>(".table-block");
    if (!container) return;

    const table = container.querySelector<HTMLTableElement>("table");
    if (!table) return;

    const tbody = table.tBodies[0] ?? table.createTBody();
    const referenceRow = tbody.rows[tbody.rows.length - 1] ?? table.querySelector("tr");
    const columnCount = referenceRow?.cells.length ?? 0;
    if (!columnCount) return;

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
}

function handleAddColumn(event: Event) {

    console.log("handleAddColumn");
    const container = (event.currentTarget as HTMLElement | null)?.closest<HTMLElement>(".table-block");
    if (!container) return;

    const table = container.querySelector<HTMLTableElement>("table");
    if (!table) return;

    const rows = Array.from(table.querySelectorAll<HTMLTableRowElement>("tr"));
    if (!rows.length) return;

    const newColumnIndex = rows[0].cells.length;

    for (const row of rows) {
        const templateCell = row.cells[row.cells.length - 1] ?? row.cells[0];
        row.append(createCellLike(templateCell));
    }

    const firstNewCell = rows[0].cells[newColumnIndex];
    if (firstNewCell) {
        focusOnElement(firstNewCell as HTMLElement);
    }
}

function createCellLike(template?: HTMLTableCellElement): HTMLTableCellElement {
    const tag = template?.tagName?.toLowerCase() === "th" ? "th" : "td";
    const cell = document.createElement(tag) as HTMLTableCellElement;
    cell.contentEditable = "true";
    cell.append(document.createElement("br"));
    return cell;
}