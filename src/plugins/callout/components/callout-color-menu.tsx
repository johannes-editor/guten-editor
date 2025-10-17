/** @jsx h */
import { h, OverlayCtor, BlockOptions } from "../../index.ts";
import { type BlockOptionsProps } from "../../block-options/components/block-options-menu.tsx";
import type { DefaultState } from "../../../components/types.ts";
import { MenuUI } from "../../../design-system/components/menu-ui.tsx";
import { ColorVariant } from "./types.ts";
import { CalloutColorMenuItem } from "./callout-color-menu-item.tsx";

interface CalloutColorMenuProps extends BlockOptionsProps {
    block: HTMLElement;
    anchor: HTMLElement;
}

interface CalloutColorMenuState extends DefaultState {
    selectedIndex: number;
    background: string;
}

const BACKGROUND_VARIANTS: ColorVariant[] = [
    { id: "", labelKey: "callout_color_default", color: "var(--color-callout)", rounded: true },
    { id: "info", labelKey: "callout_color_info", color: "var(--color-callout-info)", rounded: true },
    { id: "success", labelKey: "callout_color_success", color: "var(--color-callout-success)", rounded: true },
    { id: "warning", labelKey: "callout_color_warning", color: "var(--color-callout-warning)", rounded: true },
    { id: "danger", labelKey: "callout_color_danger", color: "var(--color-callout-danger)", rounded: true },
];

export class CalloutColorMenu extends MenuUI<CalloutColorMenuProps, CalloutColorMenuState> {

    override canOverlayClasses: ReadonlySet<OverlayCtor> = new Set<OverlayCtor>([BlockOptions]);

    override props: CalloutColorMenuProps = {} as CalloutColorMenuProps;

    override state: CalloutColorMenuState = {
        selectedIndex: 0,
        background: "",
    };

    override onMount(): void {

        super.onMount?.();
        this.syncStateFromBlock();

        const backgroundItems = BACKGROUND_VARIANTS.map((variant) =>
            this.renderVariant(variant, "callout-background-")
        );

        this.props.children = backgroundItems;
    }

    override afterRender(): void {
        super.afterRender();
        this.positionRelativeToMenu(this.props.anchor)
    }

    private syncStateFromBlock(): void {
        const { block } = this.props;
        const background = block.getAttribute("data-callout-variant") ?? "";
        this.setState({ background });
    }

    private renderVariant(variant: ColorVariant, dataIdPrefix: string): HTMLElement {
        return (
            <CalloutColorMenuItem
                variant={variant}
                block={this.props.block}
                isActiveVariant={this.isActiveVariant.bind(this)}
                handleBackgroundChange={this.handleBackgroundChange.bind(this)}
                data-block-options-id={`${dataIdPrefix}${variant.id || "default"}`}
            />
        ) as HTMLElement;
    }


    private isActiveVariant(variant: ColorVariant): boolean {
        return this.state.background === variant.id;
    }

    private handleBackgroundChange = (variantId: string) => {
        const { block } = this.props;
        if (variantId) block.setAttribute("data-callout-variant", variantId);
        else block.removeAttribute("data-callout-variant");
        this.setState({ background: variantId });
    };
}