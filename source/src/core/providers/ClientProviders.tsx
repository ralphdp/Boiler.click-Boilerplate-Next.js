"use client";

import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "@/core/i18n/LanguageProvider";

export function ClientProviders({ children, locale, taglineOverride, siteTitleOverride }: { children: React.ReactNode, locale: string, taglineOverride?: string, siteTitleOverride?: string }) {
    return (
        <SessionProvider>
            <LanguageProvider initialLocale={locale} taglineOverride={taglineOverride} siteTitleOverride={siteTitleOverride}>
                {children}
            </LanguageProvider>
        </SessionProvider>
    );
}
