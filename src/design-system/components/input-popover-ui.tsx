/** @jsx h */

import { h } from "../../jsx.ts";
import { OverlayComponent } from "../../components/overlay/overlay-component.ts";
import { DefaultProps, DefaultState } from "../../components/types.ts";
import { Fragment, KeyboardKeys, t } from "../../plugins/index.ts";

import { dom } from "../../utils/index.ts";

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
        
        .guten-input-popover button{
            display: block;
            background-color: var(--color-primary);
            border-radius: var(--radius-sm);
            border-color: var(--color-primary);
            width: 330px;
            color: white;
            border: none;
            padding: var(--space-xs);
            
        }

        .guten-input-popover input {
            width: 100%;
            box-sizing: border-box;
            border-radius: var(--radius-sm);
            padding: var(--space-sm);
            border-color: var(--color-border);
            box-shadow: none;
            border: none;
            border: 1px solid var(--color-border);
        }
    `);

    override connectedCallback(): void {
        super.connectedCallback();
        this.setAttribute("class", "guten-input-popover card animate-overlay");

        this.registerEvent(this.input, dom.EventTypes.KeyDown, ((event: KeyboardEvent) => this.handleKeydown(event)) as EventListener);
    }

    override render(): HTMLElement {
        return (
            <Fragment>
                <input type={this.props.inputType} placeholder={this.props.inputPlaceholder} {...(this.props.inputProps)} ref={(input: HTMLInputElement | null) => { this._input = input }}></input>
                <button class="block" type="button" onClick={() => this.handleInsert()} ref={(button: HTMLButtonElement | null) => { this._button = button }}> {this.props.buttonText ?? t("insert")}</button>
            </Fragment>
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