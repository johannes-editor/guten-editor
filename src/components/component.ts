import { toKebabCase } from "../utils/utils.ts";

// deno-lint-ignore no-explicit-any
export abstract class Component<P = any, S = any> extends HTMLElement {

    props: P = {} as P;
    state: S = {} as S;

    element!: HTMLElement;

    // shadow = this.attachShadow({ mode: 'open' });

    private eventListeners: Array<[EventTarget, string, EventListenerOrEventListenerObject, boolean?]> = [];

    constructor() {
        super();
        const proto = Object.getPrototypeOf(this);

        if (proto.connectedCallback !== Component.prototype.connectedCallback) {
            console.warn(
                `${this.constructor.name} overrides 'connectedCallback'. Prefer using 'onMount()' instead.`
            );
        }

        if (proto.disconnectedCallback !== Component.prototype.disconnectedCallback) {
            console.warn(
                `${this.constructor.name} overrides 'disconnectedCallback'. Prefer using 'onUnmount()' instead.`
            );
        }
    }

    connectedCallback() {
        this.renderDOM();
        this.onMount?.();
    }

    disconnectedCallback() {
        this.onUnmount?.();
        for (const [target, type, listener, options] of this.eventListeners) {
            target.removeEventListener(type, listener, options);
        }
        this.eventListeners = [];
    }

    public setState(partial: Partial<S>) {
        const nextState = { ...this.state, ...partial };
        this.state = nextState;
        this.renderDOM();
    }

    protected registerEvent(target: EventTarget, type: string, listener: EventListenerOrEventListenerObject, options?: boolean) {
        target.addEventListener(type, listener, options);
        this.eventListeners.push([target, type, listener, options]);
    }

    protected injectStyles() {
        if (Object.prototype.hasOwnProperty.call(this, "styles")) {
            console.warn(
                `${this.constructor.name} has 'styles' as an instance property, which will be ignored. ` +
                "Define 'static styles' to apply styles to your component."
            );
        }

        const ctor = this.constructor as typeof Component;
        const styles = ctor.styles;
        if (styles && typeof styles === "string") {
            const styleEl = document.createElement("style");
            styleEl.textContent = styles;
            this.appendChild(styleEl);
        }
    }

    private renderDOM() {
        this.innerHTML = "";
        this.injectStyles();
        this.appendChild(this.render());
    }

    static get tagName(): string {
        return `x-${toKebabCase(this.name)}`;
    }

    static getTagName(): string {
        return this.tagName;
    }

    getTagName(): string {
        return (this.constructor as typeof Component).tagName;
    }

    abstract render(): HTMLElement;

    onMount?(): void;
    onUnmount?(): void;

    static styles?: string;
}