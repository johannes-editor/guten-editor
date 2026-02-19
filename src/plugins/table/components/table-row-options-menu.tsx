import { DefaultProps } from "@core/components";
import { OverlayCtor } from "@components/editor/overlay";
import { runCommand } from "@core/command";
import { MenuItemUI, MenuUI } from "@components/ui/composites/menu";
import { AddRowBelow } from "@components/ui/icons";
import { BlockOptionsMenu } from "../../block-controls/index.ts";

interface TableRowOptionsItemProps extends DefaultProps {
    table: HTMLTableElement;
}

class TableRowOptionsItem extends MenuItemUI<TableRowOptionsItemProps> {
    override connectedCallback(): void {
        this.icon = <AddRowBelow />;
        this.label = "Insert row";
        super.connectedCallback();
    }

    override onSelect(): void {
        runCommand("table.addRow", { content: this.props.table });
    }
}

interface TableRowOptionsMenuProps extends DefaultProps {
    table: HTMLTableElement;
    anchor: HTMLElement;
}

export class TableRowOptionsMenu extends MenuUI<TableRowOptionsMenuProps> {
    override canOverlayClasses: ReadonlySet<OverlayCtor> = new Set<OverlayCtor>([BlockOptionsMenu]);
    protected override positionMode: "none" | "relative" | "anchor" = "relative";

    override render() {
        return (
            <div class="guten-menu">
                <ul>
                    <li>
                        <TableRowOptionsItem table={this.props.table} />
                    </li>
                </ul>
            </div>
        );
    }
}
