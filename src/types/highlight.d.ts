
// Type-only shim for the CSS Highlights API: adds CSS.highlights/Highlight typings since Deno's lib.dom doesn't include them yet; no runtime behavior.
declare global {
    interface HighlightRegistry {
        set(name: string, highlight: Highlight): this;
        get(name: string): Highlight | undefined;
        has(name: string): boolean;
        delete(name: string): boolean;
        clear(): void;
        entries(): IterableIterator<[string, Highlight]>;
        keys(): IterableIterator<string>;
        values(): IterableIterator<Highlight>;
        forEach(
            callbackfn: (value: Highlight, key: string, parent: HighlightRegistry) => void,
            thisArg?: any
        ): void;
  }
}

export {};