export type ContextKey<T> = symbol & { __type?: T };

export function createContext<T>(debugName: string): ContextKey<T> {
  return Symbol(debugName) as ContextKey<T>;
}

type ContextRequest<T> = {
  key: ContextKey<T>;
  accept(value: T): void;
  origin?: Node;
};

const EVT = "guten:context-request";

export function provideContext<T>(
  host: EventTarget,
  key: ContextKey<T>,
  value: T,
  opts?: { scopeRoot?: HTMLElement }
): () => void {
  const handler = (ev: Event) => {
    const cev = ev as CustomEvent<ContextRequest<T>>;
    if (!cev?.detail || cev.detail.key !== key) return;

    if (opts?.scopeRoot && cev.detail.origin) {
      if (!opts.scopeRoot.contains(cev.detail.origin)) return;
    }

    cev.stopPropagation();
    cev.detail.accept(value);
  };

  host.addEventListener(EVT, handler as EventListener);
  return () => host.removeEventListener(EVT, handler as EventListener);
}

export function useContext<T>(node: Node, key: ContextKey<T>): T | undefined {
  let got: T | undefined;
  const ev = new CustomEvent<ContextRequest<T>>(EVT, {
    bubbles: true,
    composed: true,
    cancelable: false,
    detail: {
      key,
      origin: node,
      accept(v: T) { got = v; },
    },
  });
  node.dispatchEvent(ev);
  return got;
}