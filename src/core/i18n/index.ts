import { I18n } from './i18n.ts';
import type { TranslationSchema } from './types.ts';

const i18n = new I18n();

export const setLocale = (locale: string) => i18n.setLocale(locale);
export const t = (key: keyof TranslationSchema): string => i18n.t(key);
export const registerTranslation = (locale: string, translations: Record<string, string>, namespace?: string) => i18n.register(locale, translations, namespace);
export type { TranslationSchema } from './types.ts';

export const getLocale = (): string => i18n.getLocale();

export { i18n };

export * from "./locale-preference.ts";

export interface LocaleMeta {
    code: string;
    name: string;
    nativeName: string;
}

interface LocaleModule {
    default: TranslationSchema;
    languageMeta?: LocaleMeta;
}

const localeModules = import.meta.glob<LocaleModule>("./lang/*.ts", { eager: true });
// const glob = (import.meta as { glob?: <T>(pattern: string, options: { eager: true }) => Record<string, T> }).glob;
// const localeModules = typeof glob === "function"
//     ? glob<LocaleModule>("./lang/*.ts", { eager: true })
//     : {};

const localeCatalog: LocaleMeta[] = Object.entries(localeModules).map(([path, module]) => {
    const filename = path.split("/").pop() ?? "";
    const codeFromPath = filename.replace(".ts", "").toLowerCase();
    const meta = module.languageMeta ?? { code: codeFromPath, name: codeFromPath, nativeName: codeFromPath };
    const normalizedCode = (meta.code ?? codeFromPath).toLowerCase();

    return {
        code: normalizedCode,
        name: meta.name ?? normalizedCode,
        nativeName: meta.nativeName ?? meta.name ?? normalizedCode,
    };
});

export const getAvailableLocales = (): LocaleMeta[] =>
    [...localeCatalog].sort((a, b) => a.nativeName.localeCompare(b.nativeName));