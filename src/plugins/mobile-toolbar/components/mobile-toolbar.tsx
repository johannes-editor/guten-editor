import { Component } from "@core/components";

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

    private contentElement: HTMLDivElement | null = null;
    private touchDragDistanceX = 0;
    private touchDragDistanceY = 0;
    private isTouchDragging = false;
    private ignoreNextClick = false;
    private savedScrollLeft = 0;

    MobileToolbarState = {
        buttons: [],
        visible: false,
    };

    static override styles = this.extendStyles(style);

    override onMount(): void {
        this.classList.add("mobile-toolbar");
    }

    override afterRender(): void {
        this.contentElement = this.querySelector(".mobile-toolbar__content");
        this.classList.toggle("is-visible", this.state.visible);
        this.setAttribute("role", "presentation");
        this.restoreScrollPosition();
    }

    setButtons(buttons: MobileToolbarButton[]): void {
        this.setStatePreservingScroll({ buttons: [...buttons] });
    }

    setVisible(visible: boolean): void {
        if (this.state.visible === visible) return;
        this.setStatePreservingScroll({ visible });
    }

    refreshActiveStates(): void {
        this.setStatePreservingScroll({ buttons: [...this.state.buttons] });
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
                        onPointerMove={(event: PointerEvent) => this.handleButtonPointerMove(event)}
                        onPointerUp={(event: PointerEvent) => this.handleButtonPointerUp(event)}
                        onClick={(event: MouseEvent) => this.handleButtonClick(event, button)}
                    >
                        {button.icon()}
                    </button>
                ))}
            </div>
        );
    }

    private handleButtonClick(event: MouseEvent, button: MobileToolbarButton) {
        if (this.ignoreNextClick) {
            this.ignoreNextClick = false;
            return;
        }

        event.preventDefault();
        button.onClick();
        this.props.onAction?.();
        this.refreshActiveStates();
    }

    private handleButtonPointerDown(event: PointerEvent) {
        // Prevent the button from stealing focus and clearing the current selection on desktop
        if (event.pointerType === "mouse") {
            event.preventDefault();
            return;
        }

        this.touchDragDistanceX = event.clientX;
        this.touchDragDistanceY = event.clientY;
        this.isTouchDragging = false;
        this.ignoreNextClick = false;
    }

    private handleButtonPointerMove(event: PointerEvent) {
        if (event.pointerType === "mouse") return;

        const deltaX = Math.abs(event.clientX - this.touchDragDistanceX);
        const deltaY = Math.abs(event.clientY - this.touchDragDistanceY);

        if (!this.isTouchDragging && (deltaX > 4 || deltaY > 4)) {
            this.isTouchDragging = true;
            this.ignoreNextClick = true;
        }
    }

    private handleButtonPointerUp(event: PointerEvent) {
        if (event.pointerType === "mouse") return;

        this.ignoreNextClick = this.isTouchDragging;
        this.isTouchDragging = false;
        this.touchDragDistanceX = 0;
        this.touchDragDistanceY = 0;
    }

    private setStatePreservingScroll(partial: Partial<MobileToolbarState>): void {
        this.captureScrollPosition();
        this.setState(partial);
    }

    private captureScrollPosition(): void {
        if (this.contentElement) {
            this.savedScrollLeft = this.contentElement.scrollLeft;
        }
    }

    private restoreScrollPosition(): void {
        if (this.contentElement) {
            this.contentElement.scrollLeft = this.savedScrollLeft;
        }
    }
}