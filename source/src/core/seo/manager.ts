import { Metadata } from "next";
import { ACTIVE_THEME } from "@/theme/config";
import { SUPPORTED_LOCALES } from "../i18n/translations";

interface SEOMatrixProps {
    title?: string;
    description?: string;
    keywords?: string[] | string;
    ogImage?: string;
    url?: string;
    noIndex?: boolean;
    locale?: string;
    type?: "website" | "article" | "product";
}

/**
 * Vanguard Centralized Metadata Stewardship
 * Harmonizes global admin overrides with page-specific logic and granular route matrices.
 */
export async function generateSEOMatrix(
    overrides: any,
    pageProps: SEOMatrixProps = {}
): Promise<Metadata> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const path = pageProps.url || "/";

    // Attempt to fetch Route-Specific Overrides from Substrate
    let routeOverrides: any = {};
    try {
        const { getAdminDb } = await import("../firebase/admin");
        const db = getAdminDb();
        const docId = path.replace(/\//g, '_') || "home";
        const routeDoc = await db.collection("sovereign_seo_matrix").doc(docId).get();
        if (routeDoc.exists) {
            routeOverrides = routeDoc.data();
        }
    } catch (e) {
        // Fallback to global overrides if DB is unreachable or in non-server context
    }

    const siteTitle = routeOverrides.title || overrides.siteTitle || ACTIVE_THEME.siteName;
    const siteDescription = routeOverrides.description || overrides.seoDescription || overrides.typography || ACTIVE_THEME.tagline;
    const siteKeywords = routeOverrides.keywords || overrides.seoKeywords
        ? (typeof (routeOverrides.keywords || overrides.seoKeywords) === 'string'
            ? (routeOverrides.keywords || overrides.seoKeywords).split(',').map((k: string) => k.trim())
            : (routeOverrides.keywords || overrides.seoKeywords))
        : ["Sovereign", "Vanguard", "Boilerplate", "Next.js", "SaaS", "Admin Panel"];

    const siteOgImage = routeOverrides.ogImage || overrides.seoOgImage || `${siteUrl}/og-image.png`;

    const title = pageProps.title
        ? `${pageProps.title} | ${siteTitle}`
        : siteTitle;

    const description = pageProps.description || siteDescription;
    const keywords = pageProps.keywords || siteKeywords;
    const ogImage = pageProps.ogImage || siteOgImage;
    const url = `${siteUrl}${path}`;
    const currentLocale = pageProps.locale || "en";

    const isHalted = !!overrides.haltingProtocol;
    const noIndexOverride = routeOverrides.noIndex !== undefined ? routeOverrides.noIndex : pageProps.noIndex;

    // Dynamic alternate links orchestration
    const languages: Record<string, string> = {};
    SUPPORTED_LOCALES.forEach(loc => {
        languages[loc === 'it' ? 'it-IT' : loc === 'es' ? 'es-ES' : 'en-US'] = `${siteUrl}/${loc}${path}`;
    });

    return {
        metadataBase: new URL(siteUrl),
        title,
        description,
        keywords,
        alternates: {
            canonical: url,
            languages,
        },
        openGraph: {
            title,
            description,
            url,
            siteName: siteTitle,
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            locale: currentLocale === 'en' ? 'en_US' : currentLocale === 'es' ? 'es_ES' : currentLocale === 'it' ? 'it_IT' : 'en_US',
            type: (pageProps.type as any) || "website",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [ogImage],
            creator: overrides.socialX || "@rdepaz",
            site: overrides.socialX || "@rdepaz",
        },
        robots: {
            index: !noIndexOverride && !isHalted,
            follow: !noIndexOverride && !isHalted,
            googleBot: {
                index: !noIndexOverride && !isHalted,
                follow: !noIndexOverride && !isHalted,
                "max-video-preview": -1,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },
        icons: {
            icon: "/favicon.ico",
            apple: "/apple-touch-icon.png",
        },
    };
}

export function generateSchemaSteward(overrides: any, pageProps: SEOMatrixProps = {}) {
    const siteName = overrides.siteTitle || ACTIVE_THEME.siteName;
    const description = overrides.seoDescription || ACTIVE_THEME.tagline;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const url = `${siteUrl}${pageProps.url || ""}`;

    const schemas: any[] = [
        {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": siteName,
            "description": description,
            "url": siteUrl,
            "potentialAction": {
                "@type": "SearchAction",
                "target": `${siteUrl}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string"
            }
        },
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": siteName,
            "url": siteUrl,
            "logo": `${siteUrl}/logo.png`,
            "sameAs": [
                overrides.socialX,
                overrides.socialGithub,
                overrides.socialDiscord
            ].filter(Boolean)
        }
    ];

    if (pageProps.type === "product" && pageProps.title) {
        schemas.push({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": pageProps.title,
            "description": pageProps.description,
            "image": pageProps.ogImage || `${siteUrl}/product-placeholder.png`,
            "offers": {
                "@type": "Offer",
                "url": url,
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock"
            }
        });
    }

    if (pageProps.url && pageProps.url !== "/") {
        const parts = pageProps.url.split("/").filter(Boolean);
        schemas.push({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": parts.map((part, i) => ({
                "@type": "ListItem",
                "position": i + 1,
                "name": part.charAt(0).toUpperCase() + part.slice(1),
                "item": `${siteUrl}/${parts.slice(0, i + 1).join("/")}`
            }))
        });
    }

    return schemas;
}
