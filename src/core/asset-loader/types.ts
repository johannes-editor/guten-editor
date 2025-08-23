export type WhenToLoad = "startup" | "idle" | "onDemand";
export type InsertAt = "headStart" | "headEnd" | "bodyEnd";

export type StyleAsset = {
  type: "style";
  href: string;
  insertAt?: InsertAt;
  preload?: boolean;
  integrity?: string;
  crossOrigin?: "anonymous" | "use-credentials";
  id?: string;
};

export type ScriptAsset = {
  type: "script";
  src: string;
  insertAt?: InsertAt;
  async?: boolean;
  defer?: boolean;
  module?: boolean;
  integrity?: string;
  crossOrigin?: "anonymous" | "use-credentials";
  noModule?: boolean;
  id?: string;
  waitForGlobal?: string;
};

export type Asset = StyleAsset | ScriptAsset;

export type AssetBundle = {
  feature: string;
  when: WhenToLoad;
  dependsOn?: string[];
  assets: Asset[];
};