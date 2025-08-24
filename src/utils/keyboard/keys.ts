/**
 * Logical key values from `KeyboardEvent.key`.
 * Note: keep these as browser-reported values (e.g., "Control", not "Ctrl").
 * Tip: `Space` here is a single space character (' ').
 */
export class KeyboardKeys {
    static readonly Escape = 'Escape';
    static readonly Enter = 'Enter';
    static readonly Tab = 'Tab';
    static readonly Space = ' ';
    static readonly ArrowUp = 'ArrowUp';
    static readonly ArrowDown = 'ArrowDown';
    static readonly ArrowLeft = 'ArrowLeft';
    static readonly ArrowRight = 'ArrowRight';
    static readonly Backspace = 'Backspace';
    static readonly Delete = 'Delete';
    static readonly Slash = '/';
    static readonly Period = '.';
    static readonly Comma = ',';
    static readonly Shift = 'Shift';
    static readonly Control = 'Control';
    static readonly Alt = 'Alt';
    static readonly Meta = 'Meta';
}

/**
 * Display labels for modifier keys used in chord strings (UI/normalization),
 * e.g., "Ctrl+K", "Meta+/".
 * Do not confuse with `KeyboardKeys` (which mirrors `event.key` values).
 */
export const ChordModifiers = {
    Ctrl: "Ctrl",
    Alt: "Alt",
    Shift: "Shift",
    Meta: "Meta",
} as const;

/**
 * Stable names for non-letter keys based on `KeyboardEvent.code`
 * (physical key position). Used to build readable chords regardless of layout.
 * Example: `code === "BracketLeft"` → chord part "BracketLeft".
 */
export const CodeKeyNames: Record<string, string> = {
  Slash: "Slash",
  BracketLeft: "BracketLeft",
  BracketRight: "BracketRight",
  Backquote: "Backquote",
  Space: "Space", // ensures "Ctrl+Space" instead of "Ctrl+ "
  Minus: 'Minus',
  Equal: 'Equal',
  Semicolon: 'Semicolon',
  Quote: 'Quote',
  Backslash: 'Backslash',
};