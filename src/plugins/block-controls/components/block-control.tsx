import { Component } from "@core/components";
import { Tooltip } from "@components/ui/primitives/tooltip";
import type { IconProps } from "@components/ui/icons";

export interface BlockControlProps {
    controlType: "add" | "drag";
    ariaLabel: string;
    tooltipText: string;
    icon: (props: IconProps) => SVGSVGElement;
    cursor?: "pointer" | "grab";
}

export class BlockControl extends Component<BlockControlProps> {

    static override styles = this.extendStyles(/*css */`
        .block-control{
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.35;
            border: 0;
            padding: 0;
            background: transparent;
            line-height: 1;
            color: var(--color-ui-text);
        }
    ` );

    override render(): HTMLElement {
        const cursor = this.props.cursor ?? "pointer";

        return (
            <Tooltip text={this.props.tooltipText} placement="right">
                <button
                    type="button"
                    aria-label={this.props.ariaLabel}
                    data-control-type={this.props.controlType}
                    className="block-control"
                    style={`cursor: ${cursor};`}
                >
                    {this.props.icon({ size: "1.125rem", "aria-hidden": "true" })}
                </button>
            </Tooltip>
        ) as HTMLElement;
    }
}