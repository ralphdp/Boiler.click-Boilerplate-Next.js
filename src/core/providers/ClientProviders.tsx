"use client";

import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "@/core/i18n/LanguageProvider";
import { GoogleAnalytics } from "@/core/analytics/GoogleAnalytics";
import { PostHogProvider, PostHogPageView } from "@/core/analytics/PostHogProvider";

interface ClientProvidersProps {
    children: React.ReactNode;
    locale: string;
    taglineOverride?: string;
    siteTitleOverride?: string;
    gaId?: string;
    posthogId?: string;
}

export function ClientProviders({
    children,
    locale,
    taglineOverride,
    siteTitleOverride,
    gaId,
    posthogId
}: ClientProvidersProps) {
    return (
        <SessionProvider>
            <PostHogProvider posthogId={posthogId || ""}>
                <LanguageProvider initialLocale={locale} taglineOverride={taglineOverride} siteTitleOverride={siteTitleOverride}>
                    <GoogleAnalytics gaId={gaId || ""} />
                    <PostHogPageView />
                    {children}
                </LanguageProvider>
            </PostHogProvider>
        </SessionProvider>
    );
}
