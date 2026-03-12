/** @type {import('next').NextConfig} */

const securityHeaders = [
    {
        key: 'X-DNS-Prefetch-Control',
        value: 'on'
    },
    {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload'
    },
    {
        key: 'X-XSS-Protection',
        value: '1; mode=block'
    },
    {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN' // Prevents clickjacking
    },
    {
        key: 'X-Content-Type-Options',
        value: 'nosniff' // Forces MIME type matching
    },
    {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin'
    },
    {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' // Locks down hardware access
    }
];

const nextConfig = {
    // --- PERFORMANCE OPTIMIZATIONS ---
    compress: true, // Auto-compress with Gzip/Brotli
    poweredByHeader: false, // Strips X-Powered-By: Next.js (Security)

    // --- CACHE & MEMORY ---
    reactStrictMode: true,

    // --- DEPLOYMENT ARCHITECTURE ---
    output: "standalone",

    // --- SECURITY HEADERS ---
    async headers() {
        return [
            {
                // Apply these headers to all routes globally
                source: '/(.*)',
                headers: securityHeaders,
            },
        ];
    },

    // --- LOCALIZATION REDIRECTS (NON-MIDDLEWARE) ---
    async redirects() {
        return [
            {
                source: '/',
                destination: '/en',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
