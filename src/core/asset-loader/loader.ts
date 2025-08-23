import { Asset, InsertAt, ScriptAsset, StyleAsset } from "./types.ts";

const inFlight = new Map<string, Promise<void>>();
const loaded   = new Set<string>();

function keyFor(a: Asset): string {
  return a.type === "style" ? (a.id ?? a.href) : (a.id ?? a.src);
}

function ensureContainer(where: InsertAt): HTMLElement {
  switch (where) {
    case "headStart":
    case "headEnd": return document.head;
    case "bodyEnd": return document.body;
  }
}

function insert<T extends HTMLElement>(el: T, where: InsertAt) {
  const parent = ensureContainer(where);
  if (where === "headStart") parent.prepend(el);
  else parent.appendChild(el);
}

export function loadStyle(a: StyleAsset): Promise<void> {
  const key = keyFor(a);
  if (loaded.has(key)) return Promise.resolve();
  const existing = inFlight.get(key);
  if (existing) return existing;

  const p = new Promise<void>((resolve, reject) => {
    if (a.preload) {
      const preload = document.createElement("link");
      preload.rel = "preload";
      preload.as = "style";
      preload.href = a.href;
      if (a.crossOrigin) preload.crossOrigin = a.crossOrigin;
      if (a.integrity) preload.integrity = a.integrity;
      document.head.appendChild(preload);
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = a.href;
    if (a.crossOrigin) link.crossOrigin = a.crossOrigin;
    if (a.integrity) link.integrity = a.integrity;
    link.onload = () => { loaded.add(key); inFlight.delete(key); resolve(); };
    link.onerror = (e) => { inFlight.delete(key); reject(e); };

    insert(link, a.insertAt ?? "headEnd");
  });

  inFlight.set(key, p);
  return p;
}

export function loadScript(a: ScriptAsset): Promise<void> {
  const key = keyFor(a);
  if (loaded.has(key)) return Promise.resolve();
  const existing = inFlight.get(key);
  if (existing) return existing;

  const p = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    if (a.module) s.type = "module";
    if (a.noModule) (s as any).noModule = true;
    if (a.defer != null) s.defer = a.defer;
    if (a.async != null) s.async = a.async;
    if (a.crossOrigin) s.crossOrigin = a.crossOrigin;
    if (a.integrity) s.integrity = a.integrity;
    s.src = a.src;

    s.onload = () => {
      const ok = a.waitForGlobal ? !!(globalThis as any)[a.waitForGlobal] : true;
      if (!ok) { inFlight.delete(key); reject(new Error(`Global "${a.waitForGlobal}" not found`)); return; }
      loaded.add(key); inFlight.delete(key); resolve();
    };
    s.onerror = (e) => { inFlight.delete(key); reject(e); };

    insert(s, a.insertAt ?? "headEnd");
  });

  inFlight.set(key, p);
  return p;
}

export function loadAssetsSequentially(assets: Asset[]): Promise<void> {
  const styles = assets.filter(a => a.type === "style") as StyleAsset[];
  const scripts = assets.filter(a => a.type === "script") as ScriptAsset[];
  return Promise.all(styles.map(loadStyle))
    .then(async () => {
      for (const s of scripts) await loadScript(s);
    })
}
