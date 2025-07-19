/** @jsx h */
import { h } from "../../../jsx.ts";
import { Component } from "../../../components/component.ts";

export class CustomTable extends Component {

    render() {
        return (
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
    }
}