import { TranslationSchema } from "./types.ts";

export class I18n {
    private currentLocale = 'en';
    private translations: Record<string, TranslationSchema> = {};

    async setLocale(locale: string): Promise<void> {
        if (this.translations[locale]) {
            this.currentLocale = locale;
            return;
        }

        try {
            const module = await import(`./lang/${locale}.ts`);
            this.translations[locale] = module.default;
            this.currentLocale = locale;
        } catch {
            console.warn(`Locale "${locale}" not found. Falling back to 'en'.`);
            const fallback = await import('./lang/en.ts');
            this.translations['en'] = fallback.default;
            this.currentLocale = 'en';
        }
    }

    t(key: keyof TranslationSchema): string {
        return this.translations[this.currentLocale]?.[key] ?? `{{${key}}}`;
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
