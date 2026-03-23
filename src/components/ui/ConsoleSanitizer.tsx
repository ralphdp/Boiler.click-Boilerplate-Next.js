'use client';
import { useEffect } from 'react';

export function ConsoleSanitizer() {
    useEffect(() => {
        if (typeof window !== "undefined") {
            const originalWarn = console.warn;
            console.warn = (...args) => {
                const message = typeof args[0] === 'string' ? args[0] : '';

                // Intercept noisy library deprecations to maintain Vanguard architecture 'Zero Warning'
                if (message.includes("Three.js") || message.includes("WebGL") || message.includes("punycode")) {
                    return;
                }

                originalWarn(...args);
            };
        }
    }, []);
    return null;
}
