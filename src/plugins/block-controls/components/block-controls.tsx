import { Component, DefaultProps } from "@core/components";
import { PlusIcon, GripVerticalIcon } from "@components/ui/icons";
import { BlockControl } from "./block-control.tsx";

export class BlockControls extends Component<DefaultProps> {

    static override styles = this.extendStyles(/*css */`
        .block-controls{
            position: absolute;
            display: none;
            pointer-events: auto;
            align-items: center;
            gap: 6px;
        }
    ` );

    override render(): HTMLElement {
        return (
            <div className="block-controls">
                <BlockControl
                    controlType="add"
                    ariaLabel="Add paragraph below (Alt+Click to add above)"
                    tooltipText="Add paragraph below\nAlt+Click to add above"
                    icon={PlusIcon}
                    cursor="pointer"
                />
                <BlockControl
                    controlType="drag"
                    ariaLabel="Drag to move block"
                    tooltipText="Drag to move block \n Right click to open menu"
                    icon={GripVerticalIcon}
                    cursor="grab"
                />
            </div>
        ) as HTMLElement;
    }
}