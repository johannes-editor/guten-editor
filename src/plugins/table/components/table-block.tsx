import { DefaultProps } from "@core/components";
import { runCommand } from "@core/command";
import { generateBlockId } from "@utils/dom";

export function TableBlock({ children, className = "", ...props }: DefaultProps): HTMLTableElement {
    const blockClass = ["block", "table-block", className].filter(Boolean).join(" ");
    const content = children ?? (
        <table>
            <tbody>
                <tr>
                    <td contentEditable="true">{"\u00A0"}<br /></td>
                    <td contentEditable="true">{"\u00A0"}<br /></td>
                </tr>
                <tr>
                    <td contentEditable="true">{"\u00A0"}<br /></td>
                    <td contentEditable="true">{"\u00A0"}<br /></td>
                </tr>
            </tbody>
        </table>
    );

    return (
        <div
            className={blockClass}
            data-block-id={generateBlockId()}
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
    runCommand("table.addRow", { event });
}

function handleAddColumn(event: Event) {
    runCommand("table.addColumn", { event });
}