import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-production-url.com";

    return {
        rules: {
            userAgent: "*",
            allow: ["/", "/auth/handshake"],
            disallow: ["/dashboard/", "/admin/", "/api/"],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
