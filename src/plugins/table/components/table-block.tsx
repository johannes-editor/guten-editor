import { DefaultProps } from "@core/components";

export function TableBlock(props: DefaultProps): HTMLTableElement {
    return (
        <div className="block table-block" contentEditable="false">
            {props.children ?? (
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
            )}
        </div>
    );
}