"use client";

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export function PostHogProvider({ children, posthogId }: { children: React.ReactNode, posthogId: string }) {
    useEffect(() => {
        if (!posthogId) return;

        posthog.init(posthogId, {
            api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
            capture_pageview: false, // Pageview capturing processed in PageView component
            capture_pageleave: true,
            persistence: 'localStorage'
        });
    }, [posthogId]);

    if (!posthogId) return <>{children}</>;

    return <PHProvider client={posthog}>{children}</PHProvider>;
}

export function PostHogPageView() {
    useEffect(() => {
        // Track page views on route change
        const handleRouteChange = () => {
            posthog.capture('$pageview');
        };

        handleRouteChange(); // Initial page view

        // In Next.js 15/16, we often use pathname-based triggers in a layout or specific component.
    }, []);

    return null;
}
