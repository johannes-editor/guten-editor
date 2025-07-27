import { I18n } from './i18n.ts';
import type { TranslationSchema } from './types.ts';

const i18n = new I18n();

export const setLocale = (locale: string) => i18n.setLocale(locale);
export const t = (key: keyof TranslationSchema): string => i18n.t(key);
export const registerTranslation = (locale: string, translations: Record<string, string>, namespace?: string) => i18n.register(locale, translations, namespace);

export { i18n };