export const DEFAULT_LOCALE = "en";
export const LOCALE_PREFERENCE_KEY = "guten-locale-preference";

let currentLocalePreference = DEFAULT_LOCALE;

export function getStoredLocalePreference(): string | null {
    if (typeof window === "undefined") return null;
    try {
        return globalThis.localStorage.getItem(LOCALE_PREFERENCE_KEY);
    } catch {
        return null;
    }
}

export function setStoredLocalePreference(locale: string): void {
    if (typeof window === "undefined") return;
    try {
        globalThis.localStorage.setItem(LOCALE_PREFERENCE_KEY, locale);
    } catch {
        return;
    }
}

export function clearStoredLocalePreference(): void {
    if (typeof window === "undefined") return;
    try {
        globalThis.localStorage.removeItem(LOCALE_PREFERENCE_KEY);
    } catch {
        return;
    }
}

export function getCurrentLocalePreference(): string {
    return currentLocalePreference;
}

function normalizeLocale(locale: string, supportedLocales: Set<string>): string | null {
    const normalizedLocale = locale.toLowerCase();
    if (supportedLocales.has(normalizedLocale)) return normalizedLocale;

    const baseLocale = normalizedLocale.split("-")[0];
    if (baseLocale && supportedLocales.has(baseLocale)) return baseLocale;

    return null;
}

function getAutoLocale(supportedLocales: Set<string>): string | null {
    if (typeof navigator === "undefined") return null;
    if (!navigator.language) return null;

    return normalizeLocale(navigator.language, supportedLocales);
}

export function applyLocalePreference(
    requestedLocale: string,
    supportedLocales: Set<string>,
    fallbackLocale: string = DEFAULT_LOCALE,
): string {
    const normalizedFallback = normalizeLocale(fallbackLocale, supportedLocales);
    const resolvedLocale =
        requestedLocale === "auto"
            ? getAutoLocale(supportedLocales) ?? normalizedFallback ?? DEFAULT_LOCALE
            : normalizeLocale(requestedLocale, supportedLocales) ??
              getAutoLocale(supportedLocales) ??
              normalizedFallback ??
              DEFAULT_LOCALE;

    currentLocalePreference = resolvedLocale;

    if (typeof document !== "undefined") {
        document.documentElement.setAttribute("lang", resolvedLocale);
    }

    return resolvedLocale;
}