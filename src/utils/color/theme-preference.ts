export const DEFAULT_THEME = "light";
export const THEME_PREFERENCE_KEY = "guten-theme-preference";

let systemThemeCleanup: (() => void) | null = null;
let currentThemePreference = DEFAULT_THEME;

export function getStoredThemePreference(): string | null {
    if (typeof window === "undefined") return null;
    try {
        return globalThis.localStorage.getItem(THEME_PREFERENCE_KEY);
    } catch {
        return null;
    }
}

export function setStoredThemePreference(theme: string): void {
    if (typeof window === "undefined") return;
    try {
        globalThis.localStorage.setItem(THEME_PREFERENCE_KEY, theme);
    } catch {
        return;
    }
}

export function clearStoredThemePreference(): void {
    if (typeof window === "undefined") return;
    try {
        globalThis.localStorage.removeItem(THEME_PREFERENCE_KEY);
    } catch {
        return;
    }
}

export function getCurrentThemePreference(): string {
    return currentThemePreference;
}

export function applyTheme(target: HTMLElement | null, theme: string) {
    target?.setAttribute("data-guten-theme", theme);
}

export function resolveThemePreference(requestedTheme: string): string {
    if (requestedTheme !== "auto") {
        return requestedTheme;
    }

    if (typeof window === "undefined" || typeof globalThis.matchMedia !== "function") {
        return DEFAULT_THEME;
    }

    return globalThis.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function stopSystemThemeListener(): void {
    if (!systemThemeCleanup) return;
    systemThemeCleanup();
    systemThemeCleanup = null;
}

export function startSystemThemeListener(supportedThemes: Set<string>): void {
    stopSystemThemeListener();

    if (typeof globalThis === "undefined" || typeof globalThis.matchMedia !== "function") return;

    const mediaQueryList = globalThis.matchMedia("(prefers-color-scheme: dark)");

    const updateTheme = () => {
        const resolvedTheme = mediaQueryList.matches ? "dark" : "light";
        const nextTheme = supportedThemes.has(resolvedTheme) ? resolvedTheme : DEFAULT_THEME;
        applyTheme(document.documentElement, nextTheme);
    };

    updateTheme();

    if (typeof mediaQueryList.addEventListener === "function") {
        mediaQueryList.addEventListener("change", updateTheme);
        systemThemeCleanup = () => mediaQueryList.removeEventListener("change", updateTheme);
        return;
    }

    const mqlAny = mediaQueryList as unknown as {
        addListener?: (cb: () => void) => void;
        removeListener?: (cb: () => void) => void;
    };
    mqlAny.addListener?.(updateTheme);
    systemThemeCleanup = () => mqlAny.removeListener?.(updateTheme);
}

export function applyEditorTheme(requestedTheme: string, supportedThemes: Set<string>): string {
    const preference =
        requestedTheme === "auto" || supportedThemes.has(requestedTheme)
            ? requestedTheme
            : DEFAULT_THEME;

    currentThemePreference = preference;

    const resolvedTheme = resolveThemePreference(preference);
    const theme = supportedThemes.has(resolvedTheme) ? resolvedTheme : DEFAULT_THEME;

    applyTheme(document.documentElement, theme);

    if (preference === "auto") {
        startSystemThemeListener(supportedThemes);
    } else {
        stopSystemThemeListener();
    }

    return theme;
}