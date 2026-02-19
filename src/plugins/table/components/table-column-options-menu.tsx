import { DefaultProps } from "@core/components";
import { OverlayCtor } from "@components/editor/overlay";
import { runCommand } from "@core/command";
import { MenuItemUI, MenuUI } from "@components/ui/composites/menu";
import { AddColumnRight } from "@components/ui/icons";
import { BlockOptionsMenu } from "../../block-controls/index.ts";

interface TableColumnOptionsItemProps extends DefaultProps {
    table: HTMLTableElement;
}

class TableColumnOptionsItem extends MenuItemUI<TableColumnOptionsItemProps> {
    override connectedCallback(): void {
        this.icon = <AddColumnRight />;
        this.label = "Insert column";
        super.connectedCallback();
    }

    override onSelect(): void {
        runCommand("table.addColumn", { content: this.props.table });
    }
}

interface TableColumnOptionsMenuProps extends DefaultProps {
    table: HTMLTableElement;
    anchor: HTMLElement;
}

export class TableColumnOptionsMenu extends MenuUI<TableColumnOptionsMenuProps> {
    override canOverlayClasses: ReadonlySet<OverlayCtor> = new Set<OverlayCtor>([BlockOptionsMenu]);
    protected override positionMode: "none" | "relative" | "anchor" = "relative";

    override render() {
        return (
            <div class="guten-menu">
                <ul>
                    <li>
                        <TableColumnOptionsItem table={this.props.table} />
                    </li>
                </ul>
            </div>
        );
    }
}