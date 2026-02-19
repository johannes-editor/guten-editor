import { DefaultProps } from "@core/components";
import { OverlayCtor } from "@components/editor/overlay";
import { runCommand } from "@core/command";
import { MenuItemUI, MenuUI } from "@components/ui/composites/menu";
import { DeleteColumn, ArrowLeftIcon, ArrowRightIcon, ColumnPlusRightIcon, ColumnPlusLeftIcon } from "@components/ui/icons";
import { BlockOptionsMenu } from "../../block-controls/index.ts";

interface TableColumnOptionsItemProps extends DefaultProps {
    table: HTMLTableElement;
    columnIndex: number;
    targetCell?: HTMLTableCellElement | null;
    icon: Element;
    label: string;
    command: string;
}

class TableColumnOptionsItem extends MenuItemUI<TableColumnOptionsItemProps> {
    override connectedCallback(): void {
        this.icon = this.props.icon;
        this.label = this.props.label;
        super.connectedCallback();
    }

    override onSelect(): void {
        runCommand(this.props.command, {
            content: {
                table: this.props.table,
                columnIndex: this.props.columnIndex,
                targetCell: this.props.targetCell,
            },
        });
    }
}

interface TableColumnOptionsMenuProps extends DefaultProps {
    table: HTMLTableElement;
    anchor: HTMLElement;
    columnIndex: number;
    targetCell?: HTMLTableCellElement | null;
}

export class TableColumnOptionsMenu extends MenuUI<TableColumnOptionsMenuProps> {
    override canOverlayClasses: ReadonlySet<OverlayCtor> = new Set<OverlayCtor>([BlockOptionsMenu]);
    protected override positionMode: "none" | "relative" | "anchor" = "relative";

    override render() {
        return (
            <div class="guten-menu">
                <ul>
                    <li>
                        <TableColumnOptionsItem table={this.props.table} columnIndex={this.props.columnIndex} targetCell={this.props.targetCell} icon={<ColumnPlusRightIcon />} label="Add column right" command="table.addColumnRight" />
                    </li>
                    <li>
                        <TableColumnOptionsItem table={this.props.table} columnIndex={this.props.columnIndex} targetCell={this.props.targetCell} icon={<ColumnPlusLeftIcon />} label="Add column left" command="table.addColumnLeft" />
                    </li>

                    <li>
                        <TableColumnOptionsItem table={this.props.table} columnIndex={this.props.columnIndex} targetCell={this.props.targetCell} icon={<DeleteColumn />} label="Delete column" command="table.deleteColumn" />
                    </li>
                    <li>
                        <TableColumnOptionsItem table={this.props.table} columnIndex={this.props.columnIndex} targetCell={this.props.targetCell} icon={<ArrowLeftIcon />} label="Move column left" command="table.moveColumnLeft" />
                    </li>
                    <li>
                        <TableColumnOptionsItem table={this.props.table} columnIndex={this.props.columnIndex} targetCell={this.props.targetCell} icon={<ArrowRightIcon />} label="Move column right" command="table.moveColumnRight" />
                    </li>
                </ul>
            </div>
        );
    }
}