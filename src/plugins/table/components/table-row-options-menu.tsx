import { DefaultProps } from "@core/components";
import { OverlayCtor } from "@components/editor/overlay";
import { runCommand } from "@core/command";
import { MenuItemUI, MenuUI } from "@components/ui/composites/menu";
import { RowPlusBottomIcon, ArrowUpIcon, DeleteRow, ArrowDownIcon, RowPlusTopIcon } from "@components/ui/icons";
import { BlockOptionsMenu } from "../../block-controls/index.ts";

interface TableRowOptionsItemProps extends DefaultProps {
    table: HTMLTableElement;
    rowIndex: number;
    icon: Element;
    label: string;
    command: string;
}

class TableRowOptionsItem extends MenuItemUI<TableRowOptionsItemProps> {
    override connectedCallback(): void {
        this.icon = this.props.icon;
        this.label = this.props.label;
        super.connectedCallback();
    }

    override onSelect(): void {
        runCommand(this.props.command, { content: { table: this.props.table, rowIndex: this.props.rowIndex } });
    }
}

interface TableRowOptionsMenuProps extends DefaultProps {
    table: HTMLTableElement;
    anchor: HTMLElement;
    rowIndex: number;
}

export class TableRowOptionsMenu extends MenuUI<TableRowOptionsMenuProps> {
    override canOverlayClasses: ReadonlySet<OverlayCtor> = new Set<OverlayCtor>([BlockOptionsMenu]);
    protected override positionMode: "none" | "relative" | "anchor" = "relative";

    override render() {
        return (
            <div class="guten-menu">
                <ul>
                    <li>
                        <TableRowOptionsItem table={this.props.table} rowIndex={this.props.rowIndex} icon={<RowPlusTopIcon />} label="Add row above" command="table.addRowAbove" />
                    </li>
                    <li>
                        <TableRowOptionsItem table={this.props.table} rowIndex={this.props.rowIndex} icon={<RowPlusBottomIcon />} label="Add row below" command="table.addRowBelow" />
                    </li>                    
                    <li>
                        <TableRowOptionsItem table={this.props.table} rowIndex={this.props.rowIndex} icon={<DeleteRow />} label="Delete row" command="table.deleteRow" />
                    </li>
                    <li>
                        <TableRowOptionsItem table={this.props.table} rowIndex={this.props.rowIndex} icon={<ArrowUpIcon />} label="Move row up" command="table.moveRowUp" />
                    </li>
                    <li>
                        <TableRowOptionsItem table={this.props.table} rowIndex={this.props.rowIndex} icon={<ArrowDownIcon />} label="Move row down" command="table.moveRowDown" />
                    </li>
                </ul>
            </div>
        );
    }
}