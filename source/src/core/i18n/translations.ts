import { en } from './locales/en';
import { es } from './locales/es';
import { it } from './locales/it';

export const dictionary = {
    en,
    es,
    it
};

export const SUPPORTED_LOCALES = Object.keys(dictionary) as Language[];
export type Language = keyof typeof dictionary;
export type Dictionary = typeof dictionary["en"];
