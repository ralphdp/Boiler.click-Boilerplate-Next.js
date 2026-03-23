import { MetadataRoute } from 'next';
import { getAdminDb, getCollectionName } from '@/core/firebase/admin';
import { SUPPORTED_LOCALES } from '@/core/i18n/translations';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const locales = SUPPORTED_LOCALES;

    const coreRoutes = [
        '',
        '/demo',
        '/features',
        '/pricing'
    ];

    // Initialize sitemap with locale-prefixed core routes
    let entries: MetadataRoute.Sitemap = [];

    for (const locale of locales) {
        for (const route of coreRoutes) {
            entries.push({
                url: `${siteUrl}/${locale}${route}`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: route === '' ? 1.0 : 0.8,
            });
        }
    }

    // Dynamic Discovery: Fetch products from Substrate DB
    try {
        const db = getAdminDb();
        const productsSnap = await db.collection(getCollectionName("store_products")).get();

        productsSnap.docs.forEach(doc => {
            const product = doc.data();
            const slug = product.slug || doc.id;

            for (const locale of locales) {
                entries.push({
                    url: `${siteUrl}/${locale}/store/product/${slug}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.6,
                });
            }
        });
    } catch (e) {
        console.warn("[Sitemap] Product discovery fault. Skipping dynamic nodes.");
    }

    return entries;
}
