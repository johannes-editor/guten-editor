/** @jsx h */
import { h, Fragment } from "../../jsx.ts";
import { Component } from "../../components/component.ts";
import { DefaultProps, DefaultState } from "../../components/types.ts";
import { keyboard } from "../../utils/index.ts";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

interface TooltipProps extends DefaultProps {
    text?: string;
    shortcut?: string;
    placement?: TooltipPlacement;
    offset?: number;
    open?: boolean;
}

export class Tooltip<P extends TooltipProps = TooltipProps, S = DefaultState>
    extends Component<P, S> {

    static override styles = this.extendStyles(/*css*/`
        .guten-tooltip-wrap{
          position: relative;
          display: inline-block;
        }

        .guten-tooltip{
            font-weight: var(--font-weight-medium);
            font-family: var(--font-family);
            font-size: var(--font-size-xs);
            background-color: var(--tooltip-bg);
            color: var(--tooltip-text);
            display: flex;
            flex-direction: column;
            padding: var(--space-xs) var(--space-sm);
            text-align: center;
            position: absolute;
            border-radius: var(--radius-sm);
            box-shadow: var(--shadow-md);
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.15s ease-in-out;
            z-index: 99999;
        }

        .guten-tooltip-wrap:hover > .guten-tooltip,
        .guten-tooltip-wrap:focus-within > .guten-tooltip,
        .guten-tooltip[data-open="true"]{
          opacity: 1;
          transition-delay: .5s;
          display: flex;
        }

        .guten-tooltip[data-placement="top"]{
          bottom: calc(100% + var(--tooltip-offset));
          left: 50%;
          transform: translateX(-50%);
        }
        .guten-tooltip[data-placement="bottom"]{
          top: calc(100% + var(--tooltip-offset));
          left: 50%;
          transform: translateX(-50%);
        }
        .guten-tooltip[data-placement="left"]{
          right: calc(100% + var(--tooltip-offset));
          top: 50%;
          transform: translateY(-50%);
        }
        .guten-tooltip[data-placement="right"]{
          left: calc(100% + var(--tooltip-offset));
          top: 50%;
          transform: translateY(-50%);
        }

        .guten-tooltip .shortcut {
            color: grey;
            font-size: var(--font-size-xs);
            align-items: center;
            line-height: 1;
        }

        .guten-tooltip .keycap{
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
            vertical-align: middle;
            font-size: var(--font-size-xs);
            font-family: var(--font-family);
        }

        .guten-tooltip .keycap[data-symbol="true"]{
            transform: scale(var(--keycap-symbol-scale, 1));
            transform-origin: center;
        }
    `);

    private tooltipId = `tt-${Math.random().toString(36).slice(2, 9)}`;

    override render(): HTMLElement {
        const {
            children,
            text,
            shortcut,
            placement = "top",
            offset = 4,
            open = false
        } = this.props as TooltipProps;

        const shortcutEl = shortcut
            ? (
                <span class="shortcut">
                    {
                        keyboard.normalizeChord(shortcut)
                            .split("+")
                            .map((raw, i, arr) => (
                                <Fragment>
                                    {this.renderKeycap(raw.trim())}
                                    {i < arr.length - 1 && <span class="plus">+</span>}
                                </Fragment>
                            ))
                    }
                </span>
            )
            : null;

        return (
            <span class="guten-tooltip-wrap" style={`--tooltip-offset: ${offset}px;`}>
                {children}
                {(text || shortcutEl) && (
                    <span
                        id={this.tooltipId}
                        role="tooltip"
                        class="guten-tooltip"
                        data-placement={placement}
                        data-open={open ? "true" : "false"}
                    >
                        {text}
                        {/* {shortcutEl} */}
                    </span>
                )}
            </span>
        );
    }

    private renderKeycap(part: string) {
        switch (part) {
            case keyboard.ChordModifiers.Shift:
                return <kbd class="keycap" data-symbol="true" aria-label="Shift">⇧</kbd>;
            case keyboard.ChordModifiers.Meta:
                return <kbd class="keycap" data-symbol="true" aria-label="Command">⌘</kbd>;
            case keyboard.ChordModifiers.Ctrl:
                return <kbd class="keycap" aria-label="Control">Ctrl</kbd>;
            case keyboard.ChordModifiers.Alt:
                return <kbd class="keycap" aria-label="Alt">Alt</kbd>;
            default: {
                const label = /^[a-z]$/i.test(part) ? part.toUpperCase() : part;
                return <kbd class="keycap">{label}</kbd>;
            }
        }
    }
}