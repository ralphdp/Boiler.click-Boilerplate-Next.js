import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter, Fustat } from "next/font/google";
import "@/theme/globals.css";
import { ACTIVE_THEME } from "@/theme/config";
import { getGlobalOverrides } from "@/core/actions/admin";
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

export async function generateMetadata(): Promise<Metadata> {
    const overrides = await getGlobalOverrides();
    const activeTagline = overrides.typography || ACTIVE_THEME.tagline;
    const activeSiteTitle = overrides.siteTitle || ACTIVE_THEME.siteName;

    return {
        metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
        title: {
            default: activeSiteTitle,
            template: `%s | ${activeSiteTitle}`
        },
        description: activeTagline,
        keywords: ["Sovereign", "Vanguard", "Boilerplate", "Next.js 16", "SaaS", "Architecture"],
        openGraph: {
            title: activeSiteTitle,
            description: activeTagline,
            url: "/",
            siteName: activeSiteTitle,
            locale: "en_US",
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: activeSiteTitle,
            description: activeTagline,
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                "max-video-preview": -1,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },
    };
}

export default async function RootLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}>) {
    const resolvedParams = await params;
    const locale = resolvedParams.locale;

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

    const socials = {
        socialX: overrides.socialX,
        socialGithub: overrides.socialGithub,
        socialDiscord: overrides.socialDiscord
    };

    return (
        <html lang={locale} className="dark" style={{ '--accent': activeAccentColor } as React.CSSProperties}>
            <head>
                <StructuredData />
            </head>
            <body
                className={`${inter.variable} ${fustat.variable} font-sans bg-black text-white antialiased`}
            >
                <SovereignWebGL variant={activeVariant} opacity={0.15} />
                <BroadcastBanner />
                <ScrollToTop />
                <ToastProvider>
                    <ClientProviders locale={locale} taglineOverride={typographyOverride} siteTitleOverride={siteTitleOverride}>
                        <nav className="fixed top-8 right-8 z-50">
                            <AuthButton />
                        </nav>
                        {isSystemHalted ? (
                            <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 space-y-6">
                                <h1 className="text-4xl md:text-6xl font-black text-red-500 tracking-tighter uppercase font-mono">SYSTEM HALTED</h1>
                                <p className="text-white/50 text-sm md:text-base font-mono max-w-lg leading-relaxed uppercase tracking-widest">
                                    The Universal Boilerplate Architecture is currently offline for critical administrative maintenance.
                                    <br /><br />
                                    Please standby for redeployment.
                                </p>
                            </div>
                        ) : overrides.preLaunchMode && !isRootAdmin ? (
                            <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 space-y-6">
                                <h1 className="text-3xl md:text-5xl font-black text-white tracking-widest uppercase">Initializing...</h1>
                                <p className="text-[var(--accent)] text-sm md:text-base font-serif italic max-w-lg leading-relaxed">
                                    Our architecture is undergoing final calibration sequences. Access will be granted shortly.
                                </p>
                            </div>
                        ) : (
                            children
                        )}
                        <FooterTimestamp contactEmail={contactEmail} socials={socials} activeAccentColor={activeAccentColor} />
                        <CookieConsent />
                    </ClientProviders>
                </ToastProvider>
            </body>
        </html>
    );
}
