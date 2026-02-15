
import { t } from "@core/i18n";
import { OverlayComponent } from "@components/editor/overlay";
import { DefaultProps, DefaultState } from "@core/components";
import { KeyboardKeys } from "@utils/keyboard";
import { EventTypes } from "@/utils/dom/index.ts";

export interface InputPopoverUIProps extends DefaultProps {

    inputType: string;
    inputPlaceholder: string;
    buttonText?: string;
    // deno-lint-ignore no-explicit-any
    inputProps?: Record<string, any>;
}

export abstract class InputPopoverUI<P extends InputPopoverUIProps, S = DefaultState> extends OverlayComponent<P, S> {

    private _input: HTMLInputElement | null = null;
    private _button: HTMLButtonElement | null = null;

    public get input(): HTMLInputElement {
        if (!this._input) {
            throw new Error("InputPopover: input is not mounted yet. It will be available after render().");
        }
        return this._input;
    }

    public get button(): HTMLButtonElement {
        if (!this._button) {
            throw new Error("InputPopover: button is not mounted yet. It will be available after render().");
        }
        return this._button;
    }

    static override styles = this.extendStyles(/*css*/`

        .guten-input-popover {
            display: flex;
            flex-direction: column;
            gap: var(--space-sm);
            padding: var(--space-md) var(--space-md);
        }
        
        .guten-input-popover button {
            display: block;
            background-color: var(--button-primary-bg);
            border-radius: var(--button-radius);
            border: var(--button-primary-border);
            width: 100%;
            color: var(--button-primary-color);
            padding: var(--space-sm);
            font-family: var(--button-font-family);
            font-weight: var(--button-font-weight);
            font-size: var(--button-font-size);
            box-shadow: var(--button-primary-shadow);
        }

        .guten-input-popover button:hover {
            background-color: var(--button-primary-bg-hover);
        }

        .guten-input-popover button:active {
            background-color: var(--button-primary-bg-active, var(--button-primary-bg-hover));
        }

        .guten-input-popover input {
            width: 100%;
            box-sizing: border-box;
            border-radius: var(--input-radius);
            padding: var(--space-sm);
            box-shadow: none;
            border: var(--input-border);
            background-color: var(--input-bg);
            color: var(--input-color);
            width: 330px;
        }
    `);

    override connectedCallback(): void {
        super.connectedCallback();
        this.setAttribute("class", "guten-input-popover guten-modal--sheet-mobile card outline-none animate-overlay");

        this.registerEvent(this.input, EventTypes.KeyDown, ((event: KeyboardEvent) => this.handleKeydown(event)) as EventListener);
    }

    override render(): HTMLElement {
        return (
            <>
                <input class="guten-modal__input" type={this.props.inputType} placeholder={this.props.inputPlaceholder} {...(this.props.inputProps)} ref={(input: HTMLInputElement | null) => { this._input = input }}></input>
                <button class="guten-modal__button" type="button" onClick={() => this.handleInsert()} ref={(button: HTMLButtonElement | null) => { this._button = button }}> {this.props.buttonText ?? t("insert")}</button>
            </>
        );
    }

    abstract handleInsert(): void;

    private handleKeydown(event: KeyboardEvent) {
        if (event.key == KeyboardKeys.Enter) {
            event.preventDefault();
            this.handleInsert();
        }
    }
}