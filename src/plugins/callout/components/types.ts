import { TranslationSchema } from "../../index.ts";

export type ColorVariant = {
    id: string;
    labelKey: keyof TranslationSchema;
    color: string;
    rounded?: boolean;
    stroke?: string;
};