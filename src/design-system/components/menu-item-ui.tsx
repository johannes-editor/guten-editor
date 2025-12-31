/** @jsx h */
import { h } from "../../jsx.ts";
import { DefaultProps, DefaultState } from "../../components/types.ts";
import { Component } from "../../components/component.ts";
import { dom, keyboard } from "../../utils/index.ts";
import { ArrowRightIcon, CheckIcon } from "./icons.tsx";


export class MenuItemUI<P extends DefaultProps, S = DefaultState> extends Component<P, S> {

    private btn: HTMLButtonElement | null = null;

    icon?: Element;
    label?: string;
    type: "item" | "label" | "separator" = "item";

    shortcut?: string;
    isActive(): boolean { return false; }
    selected?: boolean;

    rightIndicator?: "auto" | "check" | "chevron" | "none";

    right?: Element;
    checkIcon?: Element;

    chevronIcon?: Element;

    static override styles = this.extendStyles(/*css*/`
        .guten-menu-item { 
            position: relative; 
            display: inline-flex; 
            width: 100%; 
        }

        .guten-menu-item button {
          --menu-indicator-w: 20px;
          all: unset;
          padding: var(--space-xs) var(--space-md);
          font-size: var(--button-font-size);
          font-family: var(--button-font-family);
          font-weight: var(--button-font-weight);
          display: grid;
          grid-template-columns: 1fr var(--menu-indicator-w);
          align-items: center;
          column-gap: var(--space-custom-10);
          column-gap: 20px;
          color: var(--color-ui-text);
          white-space: nowrap;
          width: 100%;
          box-sizing: border-box;
          border-radius: var(--radius-sm);
          border: 1px solid transparent;
        }

        .guten-menu-item button:hover,
        .guten-menu-item button.selected,
        .guten-menu-item button:focus {
          background-color: var(--menu-item-bg-hover);
          border: var(--menu-item-border-hover);
          color: var(--menu-item-color-hover);
          cursor: pointer;
        }

        .guten-menu-item button.selected {
          background-color: var(--menu-item-bg-selected);
          border: var(--menu-item-border-selected);
          color: var(--menu-item-color-selected);
        }

        .guten-menu-item-left  { display: inline-flex; align-items: center; gap: var(--space-custom-10); min-width: 0; }
        .guten-menu-item-icon  { display: inline-flex; }
        .guten-menu-item-icon  svg{ width: var(--icon-size-md); height: var(--icon-size-md); display: block; }
        .guten-menu-item-label { min-width: 0; }

        .guten-menu-item-right {
          display: inline-flex;
          justify-content: flex-end;
          align-items: center;
          width: var(--menu-indicator-w);
        }
        .guten-menu-item-right[data-visible="false"] { visibility: hidden; }
        .guten-menu-item-right svg { width: var(--icon-size-md); height: var(--icon-size-md); display: block; }

        .guten-menu-label{
          padding: var(--space-xs) var(--space-md);
          font-size: var(--font-size-xxs);
          text-transform: uppercase;
          letter-spacing: .08em;
          color: var(--color-muted);
        }
        .guten-menu-separator{
          border: none;
          border-top: var(--border-default);
          margin: var(--space-xs) var(--space-sm);
          height:0;
        }

        .guten-menu-item-right[data-kind="chevron"] {
          visibility: hidden;
          opacity: 0.6;
        }

        .guten-menu-item button.selected .guten-menu-item-right[data-kind="chevron"],
        .guten-menu-item button:hover .guten-menu-item-right[data-kind="chevron"],
        .guten-menu-item button:focus .guten-menu-item-right[data-kind="chevron"] {
          visibility: visible;
        }
  `);

    override connectedCallback(): void {
        super.connectedCallback();

        if (this.type !== "item") return;

        this.registerEvent(this, dom.EventTypes.MouseDown, (e: Event) => this.handleOnSelect(e));

        this.registerEvent(this, dom.EventTypes.KeyDown, (e: Event) => {
            const ke = e as KeyboardEvent;
            if (ke.key === keyboard.KeyboardKeys.Enter) {
                ke.preventDefault();
                this.handleOnSelect(ke);
            }
        });

        if (this.selected) {
            requestAnimationFrame(() => this.btn?.focus());
        }
    }

    onSelect(_event: Event): void { /* Implemented by subclass */ }

    override render(): HTMLElement {
        const type = this.type ?? "item";

        if (type === "separator") {
            return <hr class="guten-menu-separator" role="separator" /> as HTMLElement;
        }

        if (type === "label") {
            return <div class="guten-menu-label">{this.label ?? ""}</div> as HTMLElement;
        }

        const mode = this.rightIndicator ?? "auto";
        const kind =
            mode === "auto"
                ? (this.isActive() ? "check" : "none")
                : mode;

        const rightNode =
            this.right ??
            (kind === "chevron"
                ? (this.chevronIcon ?? <ArrowRightIcon />)
                : (kind === "check" ? (this.checkIcon ?? <CheckIcon />) : null));

        const hasRight = kind !== "none" || !!this.right;

        return (
            <div class="guten-menu-item">
                <button
                    type="button"
                    ref={(el: HTMLButtonElement) => (this.btn = el)}
                    class={this.selected ? "selected" : undefined}
                    tabIndex={this.selected ? 0 : -1}
                >
                    <span class="guten-menu-item-left">
                        {this.icon && <span class="guten-menu-item-icon">{this.icon}</span>}
                        {this.label && <span class="guten-menu-item-label">{this.label}</span>}
                    </span>

                    <span
                        class="guten-menu-item-right"
                        data-kind={kind}                 // <- ADICIONE ISTO
                        data-has-right={hasRight ? "true" : "false"} // opcional, mas útil
                        aria-hidden="true"
                    >
                        {hasRight ? rightNode : null}
                    </span>
                </button>
            </div>
        ) as HTMLElement;
    }

    private handleOnSelect(event: Event) {
        event.preventDefault();
        this.onSelect(event);
    }
}