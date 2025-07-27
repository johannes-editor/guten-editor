/** @jsx h */

import { h } from "../../../jsx.ts"
import { DefaultProps } from "../../../components/types.ts";
import { CustomTable } from "./custom-table.tsx";

export function CustomTableFn(props: DefaultProps) {
    return (
        <CustomTable
            className="block"
            {...props}
        >
            {props.children ?? <br />}
        </CustomTable>
    );
}