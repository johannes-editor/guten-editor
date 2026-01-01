import { TranslationSchema } from "./types.ts";
import { LOCALE_CHANGED_EVENT } from "./events.ts";

export class I18n {
    private currentLocale = 'en';
    private translations: Record<string, TranslationSchema> = {};
    private loadedLocales = new Set<string>();

    async setLocale(locale: string): Promise<void> {
        const normalizedLocale = locale.toLowerCase();
        if (this.loadedLocales.has(normalizedLocale)) {
            this.currentLocale = normalizedLocale;
            this.dispatchLocaleChanged(this.currentLocale);
            return;
        }

        try {
            const module = await import(`./lang/${normalizedLocale}.ts`);
            const existing = this.translations[normalizedLocale] ?? {};
            this.translations[normalizedLocale] = { ...module.default, ...existing };
            this.currentLocale = normalizedLocale;
            this.loadedLocales.add(normalizedLocale);
            this.dispatchLocaleChanged(this.currentLocale);
        } catch {
            const baseLocale = normalizedLocale.split("-")[0];
            if (baseLocale && baseLocale !== normalizedLocale) {
                try {
                    const module = await import(`./lang/${baseLocale}.ts`);
                    const existingBase = this.translations[baseLocale] ?? {};
                    const mergedBase = { ...module.default, ...existingBase };
                    this.translations[baseLocale] = mergedBase;
                    this.translations[normalizedLocale] = mergedBase;
                    this.currentLocale = baseLocale;
                    this.loadedLocales.add(baseLocale);
                    this.loadedLocales.add(normalizedLocale);
                    this.dispatchLocaleChanged(this.currentLocale);
                    return;
                } catch {
                    // fall through
                }
            }
            console.warn(`Locale "${normalizedLocale}" not found. Falling back to 'en'.`);
            const fallback = await import('./lang/en.ts');
            const existingFallback = this.translations['en'] ?? {};
            this.translations['en'] = { ...fallback.default, ...existingFallback };
            this.currentLocale = 'en';
            this.loadedLocales.add('en');
            this.loadedLocales.add(normalizedLocale);
            this.dispatchLocaleChanged(this.currentLocale);
        }
    }

    t(key: keyof TranslationSchema): string {
        return this.translations[this.currentLocale]?.[key] ?? `{{${key}}}`;
    }

    getLocale(): string {
        return this.currentLocale;
    }

    private dispatchLocaleChanged(locale: string): void {
        if (typeof document === "undefined") return;
        document.dispatchEvent(new CustomEvent(LOCALE_CHANGED_EVENT, { detail: { locale } }));
    }

    /**
    * Register additional translations for a given locale. If a namespace is
    * provided, the keys will be prefixed with `namespace.` to avoid collisions.
    */
    register(locale: string, translations: Record<string, string>, namespace?: string): void {
        if (!this.translations[locale]) {
            this.translations[locale] = {};
        }

        const target = this.translations[locale];
        if (namespace) {
            for (const [key, value] of Object.entries(translations)) {
                target[`${namespace}.${key}`] = value;
            }
        } else {
            Object.assign(target, translations);
        }
    }

}
