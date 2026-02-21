export function TableBlock(): HTMLTableElement {
    return (
        <div className="block table-block" contentEditable="false">
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
        </div>
    );
}