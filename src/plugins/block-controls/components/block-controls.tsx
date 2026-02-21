import { Component, DefaultProps } from "@core/components";
import { PlusIcon, GripVerticalIcon } from "@components/ui/icons";
import { BlockControl } from "./block-control.tsx";
import { t } from "@core/i18n";

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

        const addBelowLabel = t("block_control_add_below");
        const addAboveHint = t("block_control_add_above_alt_click");
        const dragMoveLabel = t("block_control_drag_move");
        const dragMenuHint = t("block_control_drag_menu_context");
        
        return (
            <div className="block-controls">
                <BlockControl
                    controlType="add"
                    ariaLabel={`${addBelowLabel}. ${addAboveHint}`}
                    tooltipText={`${addBelowLabel}\n${addAboveHint}`}
                    icon={PlusIcon}
                    cursor="pointer"
                />
                <BlockControl
                    controlType="drag"
                    ariaLabel={`${dragMoveLabel}. ${dragMenuHint}`}
                    tooltipText={`${dragMoveLabel}\n${dragMenuHint}`}
                    icon={GripVerticalIcon}
                    cursor="grab"
                />
            </div>
        ) as HTMLElement;
    }
}