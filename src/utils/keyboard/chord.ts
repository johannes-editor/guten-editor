import { isApplePlatform } from "../platform/index.ts";
import { ChordModifiers, CodeKeyNames } from "./keys.ts";

/**
 * Replace "Mod" with the platform-specific modifier ("Meta" on macOS/iOS, "Ctrl" otherwise),
 * then normalize spacing and plus separators.
 * Examples:
 * - "Mod+K" → "Meta+K" (macOS) / "Ctrl+K" (Windows/Linux)
 */
export function normalizeChord(s: string): string {
    const apple = isApplePlatform();
    return s.replace(/Mod/gi, apple ? ChordModifiers.Meta : ChordModifiers.Ctrl)
        .split("+").map(p => p.trim()).join("+");
}

/**
 * Turn a KeyboardEvent into a normalized chord string.
 * Examples: "Ctrl+Shift+K", "Meta+Slash".
 */
export function eventToChord(ev: KeyboardEvent): string {
    const parts: string[] = [];
    if (ev.ctrlKey) parts.push(ChordModifiers.Ctrl);
    if (ev.metaKey) parts.push(ChordModifiers.Meta);
    if (ev.altKey) parts.push(ChordModifiers.Alt);
    if (ev.shiftKey) parts.push(ChordModifiers.Shift);
    const key = /^[a-z]$/i.test(ev.key) ? ev.key.toUpperCase() : codeToName(ev.code) ?? ev.key;
    parts.push(key);
    return parts.join("+");
}

/** Map selected KeyboardEvent.code values to stable names used in chords. */
export function codeToName(code: string): string | null {
    const map: Record<string, string> = { Slash: CodeKeyNames.Slash, BracketLeft: CodeKeyNames.BracketLeft, BracketRight: CodeKeyNames.BracketRight, Backquote: CodeKeyNames.Backquote };
    return map[code] ?? null;
}