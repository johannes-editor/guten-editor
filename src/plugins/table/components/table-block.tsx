/** @jsx h */

import { h, DefaultProps } from "../../index.ts";

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
        </div>
    );
}