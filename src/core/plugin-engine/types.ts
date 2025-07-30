export type PluginEntry = {
  path: string;
  class: string;
  active: boolean;
};

export type PluginManifest = {
  name: string;
  author?: string;
  version?: string;
  description?: string;
  entries: PluginEntry[];
};