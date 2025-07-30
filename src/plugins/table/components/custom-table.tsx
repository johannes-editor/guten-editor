/** @jsx h */
import { h } from "../../../jsx.ts";
import { Component } from "../../../components/component.ts";

export class CustomTable extends Component {

    override onMount(): void {
        this.initContentEditable();
    }

    render() {
        return (
            <table>
                <tbody>
                    <tr>
                        <td><br /></td>
                        <td><br /></td>
                    </tr>
                    <tr>
                        <td><br /></td>
                        <td><br /></td>
                    </tr>
                </tbody>
            </table>
        );
    }

    private readonly initContentEditable = () => {
        this.contentEditable = "false";
        this.querySelectorAll("td").forEach(item => item.contentEditable = "true");
    };
}