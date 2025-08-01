/** @jsx h */

import { h, DefaultProps } from "../../index.ts";
import { Table } from "./table.tsx";

export function TableBlock(props: DefaultProps) {
    return (
        <Table
            className="block"
            {...props}
        >
            {props.children ?? <br />}
        </Table>
    );
}