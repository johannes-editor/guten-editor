import { focusOnElement } from "@utils/dom";
import { MarkdownShortcutContext, MarkdownShortcutRule, MarkdownShortcutExtensionPlugin } from "@plugins/markdown-shortcuts";
import { TableBlock } from "../components/table-block.tsx";

const TABLE_SHORTCUT_PATTERN = /^\|\|\s+(\d+)\s+(\d+)$/;

export class MarkdownShortcutTableExtension extends MarkdownShortcutExtensionPlugin {

    override shortcuts(): MarkdownShortcutRule[] {
        return [
            {
                pattern: TABLE_SHORTCUT_PATTERN,
                trigger: "space",
                sort: 96,
                onMatch: (context) => this.insertTable(context),
            },
        ];
    }

    private insertTable(context: MarkdownShortcutContext) {
        const { rows, columns } = this.getTableSize(context);
        const table = <TableBlock>{this.buildTable(rows, columns)}</TableBlock>;
        context.block.after(table);

        const firstCell = table.querySelector<HTMLTableCellElement>("td");
        const text = context.afterText.trimStart();

        if (firstCell && text) {
            firstCell.textContent = text;
            firstCell.append(<br />);
        }

        focusOnElement(firstCell ?? table);
    }

    private getTableSize(context: MarkdownShortcutContext): { rows: number; columns: number } {
        const rows = Number(context.match.match?.[1]);
        const columns = Number(context.match.match?.[2]);

        return {
            rows,
            columns,
        };
    }

    private buildTable(rows: number, columns: number): HTMLTableElement {
        const table = document.createElement("table");
        const body = document.createElement("tbody");

        for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
            const row = document.createElement("tr");

            for (let colIndex = 0; colIndex < columns; colIndex += 1) {
                const cell = document.createElement("td");
                cell.contentEditable = "true";
                cell.append("\u00A0", document.createElement("br"));
                row.append(cell);
            }

            body.append(row);
        }

        table.append(body);
        return table;
    }
}