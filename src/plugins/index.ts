/* jsx */
export { h, Fragment } from "../jsx.ts";

/* components */
export { Component } from "../components/component.ts";
export { OverlayComponent } from "../components/overlay/overlay-component.ts";
export type { DefaultProps, DefaultState } from "../components/types.ts";

/* i18n */
export type { TranslationSchema } from "../core/i18n/types.ts";
export { t, registerTranslation } from "../core/i18n/index.ts";

/* utils (namespaced, caminho explícito p/ Deno) */
export * as dom from "../utils/dom/index.ts";             // isTextInput, DomEvent, CssClass, DataAttr, InputType...
export * as keyboard from "../utils/keyboard/index.ts";   // KeyboardKeys, ChordModifiers, CodeKeyNames, normalizeChord, eventToChord, codeToName...
export * as selection from "../utils/selection/index.ts"; // hasSelection, clearSelection, getCurrentSelectionRange, findClosestAncestor...
export * as platform from "../utils/platform/index.ts";   // isApplePlatform
export * as strings from "../utils/strings/index.ts";     // toKebabCase
export * as timing from "../utils/timing/index.ts";       // debounce

/* editor utilities */
export { appendElementOnOverlayArea } from "../components/editor/index.tsx";

/* command system */
export type { Command, CommandContext, ShortcutDef, KeyChord } from "../core/command/command.ts";
export { registerCommand, runCommand } from "../core/command/index.ts";

/* ---- Legacy aliases (opcional, para não quebrar plugins existentes) ---- */


export { colorUtil } from "../utils/color/index.ts";

/** @deprecated Import from `timing.debounce` */
export { debounce } from "../utils/timing/debounce.ts";

/** @deprecated Import from `selection` namespace */
export { hasSelection, clearSelection } from "../utils/selection/selection-utils.ts";

/** @deprecated Import from `keyboard` namespace */
export { KeyboardKeys } from "../utils/keyboard/keys.ts";

/** @deprecated Import from `dom` namespace */
export { EventTypes } from "../utils/dom/events.ts";

/** @deprecated Se mudou de lugar, reexporte até a migração */
export { focusOnElement } from "../utils/dom-utils.ts"; // ajuste o caminho real se necessário

export { Plugin, PluginExtension, ExtensiblePlugin } from "../core/plugin-engine/index.ts";
// export { runCommand, runCommand } from "../core/plugin-engine/index.ts";

// import { Command, ExtensiblePlugin, , PluginExtension, registerCommand, runCommand } from "../index.ts";


/**
 * Constructor type for overlay components.
 * 
 * Used by plugins to reference or declare overlay compatibility,
 * e.g. defining which overlays can stack above others.
 */
export type { OverlayCtor } from "../components/overlay/overlay-component.ts";

/**
 * Main overlay that displays block options in the editor.
 * 
 * Exported so other overlays can reference it in `canOverlayClasses`
 * to declare they are allowed to appear above BlockOptions.
 */
export { BlockOptionsMenu as BlockOptions } from "./block-options/components/block-options-menu.tsx";


export { icons } from "../design-system/index.ts";


export { MenuUI } from "../design-system/components/menu-ui.tsx";
export type { MenuUIProps } from "../design-system/components/menu-ui.tsx";
export { MenuItemUI } from "../design-system/components/menu-item-ui.tsx";

export { FormattingToolbarExtensionPlugin } from "./formatting-toolbar/formatting-toolbar-plugin.tsx";


