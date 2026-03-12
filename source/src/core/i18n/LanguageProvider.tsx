"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { dictionary, Language } from "./translations";
import { useRouter, usePathname } from "next/navigation";

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: typeof dictionary["en"];
};

const LanguageContext = createContext<LanguageContextType>({
    language: "en",
    setLanguage: () => { },
    t: dictionary["en"],
});

export function LanguageProvider({ children, initialLocale, taglineOverride, siteTitleOverride }: { children: React.ReactNode, initialLocale?: string, taglineOverride?: string, siteTitleOverride?: string }) {
    const [language, setLanguageState] = useState<Language>((initialLocale as Language) || "en");
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!initialLocale) {
            const stored = localStorage.getItem("sovereign_language") as Language;
            if (stored && dictionary[stored]) {
                setLanguageState(stored);
            } else {
                // Attempt to derive from browser navigator
                const browserLang = navigator.language.split("-")[0] as Language;
                if (dictionary[browserLang]) {
                    setLanguageState(browserLang);
                }
            }
        } else {
            setLanguageState(initialLocale as Language);
            localStorage.setItem("sovereign_language", initialLocale);
        }
    }, [initialLocale]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("sovereign_language", lang);

        if (pathname) {
            const segments = pathname.split('/');
            // Check if the first segment (after root /) is a locale
            const currentLocale = segments[1] as Language;
            if (currentLocale && dictionary[currentLocale]) {
                segments[1] = lang; // Replace the language
                const newPath = segments.join('/');
                router.push(newPath || '/');
            } else {
                // Prepend new language
                router.push(`/${lang}${pathname}`);
            }
        }
    };

    const baseT = dictionary[language] || dictionary["en"];
    const t = { ...baseT };
    if (taglineOverride) t.tagline = taglineOverride;
    if (siteTitleOverride) t.siteName = siteTitleOverride;

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useTranslation = () => useContext(LanguageContext);
