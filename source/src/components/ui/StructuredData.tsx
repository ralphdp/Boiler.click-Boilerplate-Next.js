import React from 'react';
import { ACTIVE_THEME } from '@/theme/config';

export function StructuredData() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": ACTIVE_THEME.siteName,
        "operatingSystem": "Universal",
        "applicationCategory": "System Infrastructure",
        "description": ACTIVE_THEME.tagline,
        "author": {
            "@type": "Organization",
            "name": ACTIVE_THEME.siteName
        },
        "version": process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
