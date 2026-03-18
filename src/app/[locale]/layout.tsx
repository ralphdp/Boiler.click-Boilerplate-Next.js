import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter, Fustat } from "next/font/google";
import "@/theme/globals.css";
import { ACTIVE_THEME } from "@/theme/config";
import { getGlobalOverrides } from "@/core/actions/system";
import { auth } from "@/core/auth";
import { ClientProviders } from "@/core/providers/ClientProviders";
import { AuthButton } from "@/components/ui/AuthButton";
import { FooterTimestamp } from "@/components/ui/FooterTimestamp";
import { SovereignWebGL } from "@/components/ui/SovereignWebGL";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { StructuredData } from "@/components/ui/StructuredData";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { BroadcastBanner } from "@/components/ui/BroadcastBanner";
import { ToastProvider } from "@/components/ui/Toast";
import { WaitlistScreen } from "@/components/ui/WaitlistScreen";
import { SovereignErrorBoundary } from "@/components/ui/SovereignErrorBoundary";
import { GlobalCommandPalette } from "@/components/ui/GlobalCommandPalette";
import { SessionRevalidator } from "@/components/ui/SessionRevalidator";
import { dictionary, Language } from "@/core/i18n/translations";
import { ChatFloating } from "@/components/chat/ChatFloating";
import { SovereignProgressBar } from "@/components/ui/SovereignProgressBar";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: 'swap',
});

const fustat = Fustat({
    subsets: ["latin"],
    variable: "--font-fustat",
    display: 'swap',
});

import { generateSEOMatrix, generateSchemaSteward } from "@/core/seo/manager";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const overrides = await getGlobalOverrides();
    return generateSEOMatrix(overrides, { locale });
}

export default async function RootLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}>) {
    const resolvedParams = await params;
    const locale = resolvedParams.locale as Language;
    const t = dictionary[locale] || dictionary["en"];

    const cookieStore = await cookies();
    const activeVariant = (cookieStore.get("sovereign_webgl_variant")?.value || "fire") as 'matrix' | 'fire' | 'galaxy' | 'none';

    const overrides = await getGlobalOverrides();
    const typographyOverride = overrides.typography;
    const contactEmail = overrides.contactEmail;
    const siteTitleOverride = overrides.siteTitle;
    const activeAccentColor = overrides.primaryColor || ACTIVE_THEME.primaryColor;

    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    // Halting Protocol Check
    const isSystemHalted = overrides.haltingProtocol && !isRootAdmin;

    // SEO Schema Matrix
    const schema = generateSchemaSteward(overrides, { locale });

    const socials = {
        socialX: overrides.socialX,
        socialGithub: overrides.socialGithub,
        socialDiscord: overrides.socialDiscord
    };

    return (
        <html lang={locale} className="dark" style={{
            '--accent': activeAccentColor
        } as React.CSSProperties}>
            <head>
                <StructuredData schema={schema} />
            </head>
            <body
                className={`${inter.variable} ${fustat.variable} font-sans bg-black text-white antialiased`}
            >
                <SovereignErrorBoundary>
                    <SovereignProgressBar />
                    <SovereignWebGL variant={activeVariant} opacity={0.15} />
                    <BroadcastBanner message={overrides.broadcast} urgency={overrides.broadcastUrgency as any} />
                    <ScrollToTop />
                    <ToastProvider>
                        <ClientProviders
                            locale={locale}
                            taglineOverride={typographyOverride}
                            siteTitleOverride={siteTitleOverride}
                            gaId={overrides.gaId}
                            posthogId={overrides.posthogId}
                        >
                            <SessionRevalidator />
                            <nav className="fixed top-8 right-8 z-50">
                                <AuthButton />
                            </nav>
                            <GlobalCommandPalette />
                            {isSystemHalted ? (
                                <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 space-y-6">
                                    <h1 className="text-4xl md:text-6xl font-black text-red-500 tracking-tighter uppercase font-mono">{t.systemHalted.title}</h1>
                                    <p className="text-white/50 text-sm md:text-base font-mono max-w-lg leading-relaxed uppercase tracking-widest">
                                        {t.systemHalted.descLine1}
                                        <br /><br />
                                        {t.systemHalted.descLine2}
                                    </p>
                                </div>
                            ) : overrides.preLaunchMode && !isRootAdmin ? (
                                <WaitlistScreen siteName={siteTitleOverride || ACTIVE_THEME.siteName} />
                            ) : (
                                children
                            )}
                            <FooterTimestamp contactEmail={contactEmail} socials={socials} activeAccentColor={activeAccentColor} modules={overrides.modules} />
                            <CookieConsent />
                            {overrides.modules.aiSupport && <ChatFloating />}
                        </ClientProviders>
                    </ToastProvider>
                </SovereignErrorBoundary>
            </body>
        </html>
    );
}
