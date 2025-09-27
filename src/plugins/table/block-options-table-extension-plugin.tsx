/** @jsx h */
import { h, t } from "../index.ts";
import { BlockOptionsExtensionPlugin, BlockOptionsMenuItem } from "../block-options/block-options-plugin.tsx";
import { TableHeaderIcon } from "../../design-system/components/icons.tsx";

export class BlockOptionsTableExtensionPlugin extends BlockOptionsExtensionPlugin {
    override items(block: HTMLElement): BlockOptionsMenuItem[] {
        const table = block.querySelector("table");
        if (!table) return [];

        const hasHeader = table.querySelector("thead") !== null;

        return [
            {
                id: "toggleTableHeader",
                icon: <TableHeaderIcon />,
                label: hasHeader ? t("remove_table_header") : t("add_table_header"),
                sort: 50,
                onSelect: ({ close }) => {
                    this.toggleHeader(table, hasHeader);
                    close();
                },
            },
        ];
    }

    private toggleHeader(table: HTMLTableElement, hasHeader: boolean) {
        if (hasHeader) {
            const thead = table.querySelector("thead");
            const tbody = table.querySelector("tbody");
            if (!thead || !tbody) return;
            const rows = Array.from(thead.rows);
            for (const row of rows.reverse()) {
                const newRow = table.ownerDocument.createElement("tr");
                Array.from(row.cells).forEach((cell) => {
                    const td = table.ownerDocument.createElement("td");
                    td.innerHTML = cell.innerHTML || "<br />";
                    newRow.appendChild(td);
                });
                tbody.insertBefore(newRow, tbody.firstChild);
            }
            thead.remove();
        } else {
            let tbody = table.querySelector("tbody");
            if (!tbody) {
                tbody = table.ownerDocument.createElement("tbody");
                table.appendChild(tbody);
            }
            const firstRow = tbody.querySelector("tr");
            if (!firstRow) return;

            const thead = table.ownerDocument.createElement("thead");
            const headerRow = table.ownerDocument.createElement("tr");
            Array.from(firstRow.cells).forEach((cell) => {
                const th = table.ownerDocument.createElement("th");
                th.innerHTML = cell.innerHTML || "<br />";
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.insertBefore(thead, tbody);
            firstRow.remove();
        }
    }
}
