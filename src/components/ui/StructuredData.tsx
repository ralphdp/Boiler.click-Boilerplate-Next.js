import React from 'react';
import { ACTIVE_THEME } from '@/theme/config';

interface StructuredDataProps {
    schema: Record<string, any>;
}

export function StructuredData({ schema }: StructuredDataProps) {
    return (
        <script
            id="vanguard-structured-data"
            suppressHydrationWarning
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
