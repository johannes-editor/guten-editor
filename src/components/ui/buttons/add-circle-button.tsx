import { PlusIcon } from "@components/ui/icons";

const ADD_CIRCLE_BUTTON_STYLE_ID = "guten-add-circle-button-style";

const ADD_CIRCLE_BUTTON_STYLES = /*css*/`
    .guten-add-circle-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;
    line-height: 1;
    border-radius: 50%;
    box-sizing: border-box;
    border: 2px solid color-mix(in srgb, var(--color-border) 70%, transparent);
    color: color-mix(in srgb, var(--color-text) 42%, white);
    cursor: pointer;
    background: transparent;
    -webkit-appearance: none;
    appearance: none;
  }
`;

function ensureAddCircleButtonStyles(): void {
    if (typeof document === "undefined") return;
    if (document.getElementById(ADD_CIRCLE_BUTTON_STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = ADD_CIRCLE_BUTTON_STYLE_ID;
    style.textContent = ADD_CIRCLE_BUTTON_STYLES;
    document.head.appendChild(style);
}

type AddCircleButtonProps = {
    ariaLabel?: string;
    className?: string;
    onClick?: (event: MouseEvent) => void;
};

export function AddCircleButton({ ariaLabel, className, onClick }: AddCircleButtonProps = {}) {
    
    ensureAddCircleButtonStyles();

    const mergedClassName = ["guten-add-circle-button", className].filter(Boolean).join(" ");

    return (
        <button
            type="button"
            className={mergedClassName}
            aria-label={ariaLabel}
            title={ariaLabel}
            onClick={onClick}
        >
            <PlusIcon size={16} />
        </button>
    );
}
