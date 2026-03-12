"use client";

import { useState } from "react";
import { useTranslation } from "@/core/i18n/LanguageProvider";
import { Language } from "@/core/i18n/translations";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
    const { language, setLanguage } = useTranslation();
    const [open, setOpen] = useState(false);

    const handleSelect = (lang: Language) => {
        setLanguage(lang);
        setOpen(false);
    };

    return (
        <div className="relative inline-flex items-center gap-2 group">
            <Globe size={12} className="text-white/30 group-hover:text-[var(--accent)] transition-colors" />
            <button
                onClick={() => setOpen(!open)}
                className="appearance-none bg-transparent text-[8px] font-black uppercase tracking-widest text-white/50 hover:text-white cursor-pointer outline-none ring-0 border-none transition-colors"
                aria-label="Select Language"
            >
                {language.toUpperCase()}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute bottom-full right-0 mb-4 w-16 bg-black/90 backdrop-blur-xl border border-white/10 p-2 flex flex-col gap-1 z-50">
                        {(["en", "es", "it"] as Language[]).map((lang) => (
                            <button
                                key={lang}
                                onClick={() => handleSelect(lang)}
                                className={`px-2 py-1 text-[8px] font-black uppercase tracking-widest text-center transition-colors ${language === lang ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
