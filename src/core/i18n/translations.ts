import { en } from './locales/en/index';
import { es } from './locales/es/index';
import { it } from './locales/it/index';
import { common } from './locales/common';

export const dictionary = {
    en: { ...common, ...en },
    es: { ...common, ...es },
    it: { ...common, ...it }
};

export const SUPPORTED_LOCALES = Object.keys(dictionary) as Language[];
export type Language = keyof typeof dictionary;
export type Dictionary = typeof dictionary["en"];
