/** @jsx h */
import { h } from '../../../jsx.ts';
import { Component } from '../../../components/component.ts';
import { DefaultProps } from "../../index.ts";

export interface CalloutProps {
    content: string;
}

// export class Callout extends Component<CalloutProps> {
//     render() {
//         return <div class="callout">{this.props.content}</div>;
//     }
// }



export function Callout(props: DefaultProps) {
    return (
        <div class="callout">
            <p>Este é um exemplo de um callout de informação. Use-o para destacar informações relevantes.</p>
        </div>
    );
}



export function Blockquote(props: DefaultProps) {
    return (
        <blockquote
            className={`block placeholder ${!props.children && "empty"}`}
            data-placeholder="To be or not to be"
            {...props}
        >
            {props.children ?? <br />}
        </blockquote>
    );
}