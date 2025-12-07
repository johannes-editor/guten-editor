/** @jsx h */

import { h } from "../../../jsx.ts";
import { Component } from "../../index.ts";

import style from "./style.css?inline";

export type MobileToolbarButton = {
    id: string;
    icon: () => SVGElement;
    label: string;
    onClick: () => void;
    isActive?: () => boolean;
    sort?: number;
};

interface MobileToolbarProps {
    onAction?: () => void;
}

interface MobileToolbarState {
    buttons: MobileToolbarButton[];
    visible: boolean;
}

export class MobileToolbar extends Component<MobileToolbarProps, MobileToolbarState> {

    MobileToolbarState = {
        buttons: [],
        visible: false,
    };

    static override styles = this.extendStyles(style);

    override onMount(): void {
        this.classList.add("mobile-toolbar");
    }

    override afterRender(): void {
        this.classList.toggle("is-visible", this.state.visible);
        this.setAttribute("role", "presentation");
    }

    setButtons(buttons: MobileToolbarButton[]): void {
        this.setState({ buttons: [...buttons] });
    }

    setVisible(visible: boolean): void {
        if (this.state.visible === visible) return;
        this.setState({ visible });
    }

    refreshActiveStates(): void {
        this.setState({ buttons: [...this.state.buttons] });
    }

    override render(): HTMLElement {
        const { buttons } = this.state;

        return (
            <div class="mobile-toolbar__content" role="toolbar" aria-hidden={!this.state.visible}>
                {buttons?.map((button) => (
                    <button
                        type="button"
                        class={`mobile-toolbar__button${button.isActive?.() ? " is-active" : ""}`}
                        aria-label={button.label}
                        title={button.label}
                        onPointerDown={(event: PointerEvent) => this.handleButtonPointerDown(event)}
                        onClick={(event: MouseEvent) => this.handleButtonClick(event, button)}
                    >
                        {button.icon()}
                    </button>
                ))}
            </div>
        );
    }

    private handleButtonClick(event: MouseEvent, button: MobileToolbarButton) {
        event.preventDefault();
        button.onClick();
        this.props.onAction?.();
        this.refreshActiveStates();
    }

    private handleButtonPointerDown(event: PointerEvent) {
        // Prevent the button from stealing focus and clearing the current selection
        event.preventDefault();
    }
}