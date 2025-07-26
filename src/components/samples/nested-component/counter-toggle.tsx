/** @jsx h */
import { Fragment, h } from "../../../jsx.ts";
import { Component } from "../../component.ts";
import { Counter } from "./counter.tsx";
import { DefaultProps } from "../../types.ts";

interface CounterToggleState {
    mounted: boolean;
    count: number;
}

export class CounterToggle extends Component<DefaultProps, CounterToggleState> {

    // styles = /*css*/ `
    //     .counter-holder {
    //         padding: 10px;
    //         background: #eee;
    //     }
    //     button {
    //         color: green;
    //     }
    // `;

    constructor() {
        super();

        this.state = {
            mounted: true,
            count: 1,
        };
    }

    private increment = () => {
        console.log("incremented");
        this.setState({ count: this.state.count + 1 });
    };

    private toggle = () => {
        this.setState({ mounted: !this.state.mounted });
    };

    render() {
        return (
            <Fragment>
                <div class="counter-holder">
                    <span>mounted: {String(this.state.mounted)}</span>
                    {this.state.mounted && <Counter count={this.state.count} increment={this.increment} />}
                </div>
                <button type="button" onClick={this.toggle}>Toggle Counter</button>
            </Fragment>
        );
    }
}
