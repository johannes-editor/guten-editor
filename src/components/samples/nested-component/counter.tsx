/** @jsx h */
import { h } from "../../../jsx.ts";
import { Component } from "../../component.ts";

export interface CounterProps {
    count: number;
    increment: () => void;
}

export class Counter extends Component<CounterProps> {
    override state = { count: 1 };

    static styles = `ba`;

    private readonly handleKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            this.state.count = this.props.count ?? 0;
        }

        if (e.key === "a") {
            console.log("a pressed");
        }
    };

    override onMount() {
        console.log("mounted element");

        this.on(document, "keydown", this.handleKey as EventListener);
    }

    override onUnmount() {
        console.log("unmounted element");
    }

    render() {
        return (
            <div>
                <span>{this.props.count}</span>
                <button onClick={this.props.increment}>+</button>
            </div>
        );
    }
}
