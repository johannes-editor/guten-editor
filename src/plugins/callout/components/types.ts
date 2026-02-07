import { TranslationSchema } from "@core/i18n/types.ts";

export type ColorVariant = {
    id: string;
    labelKey: keyof TranslationSchema;
    color: string;
    rounded?: boolean;
    stroke?: string;
};