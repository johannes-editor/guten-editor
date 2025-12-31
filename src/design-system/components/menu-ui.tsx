/** @jsx h */
import { h, keyboard, dom } from "../../plugins/index.ts";
import type { DefaultProps, DefaultState } from "../../components/types.ts";
import { OverlayComponent } from "../../components/overlay/overlay-component.tsx";

export interface MenuUIProps extends DefaultProps {
    anchor?: HTMLElement;
}

export interface MenuUIState extends DefaultState {
    selectedIndex: number
}

export class MenuUI<P extends MenuUIProps = MenuUIProps, S extends MenuUIState = MenuUIState> extends OverlayComponent<P, S> {

    override state = { selectedIndex: 0 } as S;

    private _childrenMenus = new Set<HTMLElement>();
    private _didInitialPosition = false;
    private _lastSelectedAnchor: HTMLElement | null = null;
    private _hoverByMouseEnabled = true;

    protected autoFocusFirst = true;
    protected positionMode: "none" | "relative" | "anchor" = "none";
    protected lockWidthOnOpen = false;
    protected closeOnAnchorLoss = true;

    static override styles = this.extendStyles(/*css*/`
        .guten-menu ul{
            margin:0;
            padding:var(--space-sm);
            display:inline-flex;
            flex-direction:column;
            gap:4px;
            width:max-content;
        }

        .guten-menu ul li{ list-style:none; width:100%; box-sizing:border-box; }

        .guten-menu ul li:has(> hr.guten-menu-separator) {
            text-align: center;
        }

        .guten-menu-label{
            padding: var(--space-xs) var(--space-md);
            font-size: var(--font-size-xxs);
            text-transform: uppercase;
            letter-spacing: .08em;
            color: var(--color-muted);
        }

        .guten-menu-separator{
            display: inline-block;
            width: 90%;
            height: 1px;
            border: 0;
            margin: 8px 0;
            background: linear-gradient(
              to right,
              transparent,
              var(--sep-color) 12%,
              var(--sep-color) 88%,
              transparent
            );
        }
    `);

    override connectedCallback(): void {

        super.connectedCallback();
        this.classList.add("card", "animate-overlay");

        this.registerEvent(this, dom.EventTypes.KeyDown, this.onKeyDown as EventListener);
        this.registerEvent(this, dom.EventTypes.FocusIn, this.onFocusIn as EventListener);
        this.registerEvent(this, dom.EventTypes.Mouseover, this.onMouseOver as EventListener);
        this.registerEvent(this, dom.EventTypes.MouseMove, this.onMouseMove as EventListener);

        if (this.autoFocusFirst !== false) {
            this.setState({ selectedIndex: 0 } as Partial<S>);
        }
    }

    override afterRender(): void {

        if ((!this.props.anchor || !this.props.anchor.isConnected) && this.closeOnAnchorLoss) {
            this.remove();
            return;
        }

        super.afterRender();
        this.applySelection();
        this.maybeInitialReposition();
    }

    override onUnmount(): void {
        super.onUnmount?.();
        this.removeChildren();
        this.restoreFocusToAnchor();
    }

    override onMount(): void {

        if ((!this.props.anchor || !this.props.anchor.isConnected) && this.closeOnAnchorLoss) {
            this.remove();

            return;
        }

        super.onMount?.();

        const parent = MenuUI.findParentByTrigger(this.props.anchor || null);
        parent?.appendChildMenu(this);

        if ((!this.props.anchor || !this.props.anchor.isConnected) && this.closeOnAnchorLoss) {
            this.remove();
        }
    }

    private onMouseMove = (_e: MouseEvent) => {
        this._hoverByMouseEnabled = true;
    };

    private onMouseOver = (e: MouseEvent) => {
        if (!this._hoverByMouseEnabled) return;
        const btn = (e.target as HTMLElement)?.closest?.("button") as HTMLButtonElement | null;
        if (!btn || !this.contains(btn)) return;

        const buttons = Array.from(this.querySelectorAll<HTMLButtonElement>("button"));
        const idx = buttons.indexOf(btn);
        if (idx < 0 || idx === (this.state as MenuUIState).selectedIndex) return;

        this.setState({ selectedIndex: idx } as Partial<S>);
    };

    public appendChildMenu(menu: HTMLElement) {

        if (!menu) return;
        this._childrenMenus.add(menu);

        const parent = menu.parentElement;
        if (parent) {
            const mo = new MutationObserver(() => {
                if (!parent.contains(menu)) {
                    mo.disconnect();
                    this._childrenMenus.delete(menu);
                }
            });
            mo.observe(parent, { childList: true });
        }
    }

    protected restoreFocusToAnchor() {
        const target = this.props.anchor;
        if (!target || !document.contains(target)) return;
        try { (target as any).focus({ preventScroll: true }); }
        catch { target.focus(); }
    }

    removeChildren() {
        this._childrenMenus.forEach((m) => m.isConnected && m.remove());
        this._childrenMenus.clear();
    }

    /**
    * Syncs selection when a descendant button receives focus.
    * @param e Focus event from the menu container.
    */
    private onFocusIn = (e: FocusEvent) => {
        const btn = (e.target as HTMLElement)?.closest?.("button") as HTMLButtonElement | null;
        if (!btn) return;
        const buttons = Array.from(this.querySelectorAll<HTMLButtonElement>("button"));
        const idx = buttons.indexOf(btn);
        if (idx >= 0 && idx !== (this.state as MenuUIState).selectedIndex) {
            this.setState({ selectedIndex: idx } as Partial<S>);
        }
    };

    /**
    * Handles keyboard navigation when focus is within the menu.
    * - ArrowDown/ArrowUp: cycle selection
    * - Enter: let the native <button> click fire
    */

    protected onKeyDown(e: KeyboardEvent) {
        const count = this.getItemCount();
        if (!count || !this.contains(document.activeElement)) return;

        const sel = (this.state as MenuUIState).selectedIndex ?? 0;

        const lockHover = () => { this._hoverByMouseEnabled = false; };

        switch (e.key) {
            case keyboard.KeyboardKeys.ArrowDown:
                e.preventDefault();
                lockHover();
                this.setState({ selectedIndex: (sel + 1) % count } as Partial<S>);
                break;

            case keyboard.KeyboardKeys.ArrowUp:
                e.preventDefault();
                lockHover();
                this.setState({ selectedIndex: (sel - 1 + count) % count } as Partial<S>);
                break;

            case keyboard.KeyboardKeys.Enter:
                lockHover();
                break;
        }
    }

    /**
    * Applies selection styles and roving tabIndex to all descendant buttons.
    * Optionally focuses the selected button.
    * @param forceFocus When true, always focus the selected button.
    */
    private applySelection(forceFocus = false) {
        const buttons = Array.from(this.querySelectorAll<HTMLButtonElement>("button"));
        const count = buttons.length; if (!count) return;
        const raw = (this.state as MenuUIState).selectedIndex ?? 0;
        const idx = Math.min(Math.max(raw, 0), count - 1);

        buttons.forEach((b, i) => {
            b.classList.toggle("selected", i === idx);
            b.tabIndex = i === idx ? 0 : -1;
        });

        const selectedBtn = buttons[idx];

        if (selectedBtn !== this._lastSelectedAnchor) {
            this._lastSelectedAnchor = selectedBtn;
            this._childrenMenus.forEach((child) => {
                const childAny = child as any;
                const childAnchor: HTMLElement | null | undefined = childAny?.props?.anchor;
                if (!childAnchor || childAnchor !== selectedBtn) {
                    child.remove();
                    this._childrenMenus.delete(child);
                }
            });
        }

        const focusedInside = this.contains(document.activeElement);
        if (selectedBtn && (forceFocus || !focusedInside || document.activeElement === this)) {
            requestAnimationFrame(() => {
                try { (selectedBtn as any).focus({ preventScroll: true }); }
                catch { selectedBtn.focus(); }
            });
        }
    }

    /**
    * @returns Number of descendant <button> elements considered as menu items.
    */
    protected getItemCount(): number {
        return this.querySelectorAll<HTMLButtonElement>("button").length;
    }

    /**
    * @param Zero-based index within the list of descendant buttons.
    * @returns The button at the given index, or null.
    */
    protected getButtonAtIndex(index: number): HTMLButtonElement | null {
        const buttons = this.querySelectorAll<HTMLButtonElement>("button");
        return buttons[index] ?? null;
    }

    /**
    * One-shot initial positioning:
    * - No-ops if already done, no `anchor`, or `positionMode === "none"`.
    * - Optionally locks current width to avoid reflow during animation.
    * - Uses double rAF to ensure layout is settled before positioning.
    * - Calls `positionRelativeToMenu(anchor)` or `positionToAnchor(anchor)` accordingly.
    */
    private maybeInitialReposition() {
        if (this._didInitialPosition) return;
        const { anchor } = this.props as MenuUIProps;
        if (!anchor || !anchor.isConnected || this.positionMode === "none") return;

        if (this.lockWidthOnOpen) {
            const { width } = this.getBoundingClientRect();
            if (width > 0) this.style.minWidth = `${width}px`;
        }
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (!anchor.isConnected) { this.remove(); return; }
                if (this.positionMode === "relative") this.positionRelativeToMenu(anchor);
                else this.positionToAnchor(anchor);
                this._didInitialPosition = true;
                // if (this.lockWidthOnOpen) setTimeout(() => (this.style.minWidth = ""), 160);
            });
        });
    }


    render() {
        return (
            <div class="guten-menu">
                <ul>
                    {Array.isArray(this.props.children)
                        ? this.props.children.map((child, i) => <li key={i}>{child}</li>)
                        : <li>{this.props.children}</li>}
                </ul>
            </div>
        );
    }



    static findParentByTrigger(trigger: HTMLElement | null): MenuUI | null {
        if (!trigger) return null;
        const wrapper = trigger.closest(".guten-menu") as HTMLElement | null;
        const host = wrapper?.parentElement as any;
        return host && typeof host.appendChildMenu === "function" ? host as MenuUI : null;
    }
}
