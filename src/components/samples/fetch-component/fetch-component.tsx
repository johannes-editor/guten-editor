/** @jsx h */
import { h } from "../../../jsx.ts";
import { Component } from "../../component.ts";
import { DefaultProps } from "../../types.ts";

interface FetchComponentState {
    data: any | null;
    loading: boolean;
}

export class FetchButton extends Component<DefaultProps, FetchComponentState> {

    fetchData = async () => {

        this.setState({ loading: true });

        try {

            const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
            if (response.ok) {
                const data = await response.json();
                this.setState({ data: data });

            }

        } catch (err) {
            console.error(err);
        }

        this.setState({ loading: false });
    }

    render() {
        return (
            <div>
                <button type="button" onClick={this.fetchData}>Button</button>
                {this.state.loading && <p>loading...</p>}
                {this.state.data && <pre>{JSON.stringify(this.state.data, null, 2)}</pre>}
            </div>
        );
    }
}