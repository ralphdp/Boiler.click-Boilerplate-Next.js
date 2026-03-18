import NextAuth from "next-auth";
import { authConfig } from "./src/core/auth.config";
import { NextResponse } from "next/server";
import { checkEdgeRateLimit } from "./src/core/security/rate-limiter-edge";
import { getEdgeFeatureFlags } from "./src/core/security/feature-flags-edge";
import { getEdgeConfig } from "./src/core/security/edge-config";
import { SECURITY_CONFIG } from "./src/core/security/security-config";
import { checkDomainShield } from "./src/core/security/domain-shield-edge";
import { generateCSP } from "./src/core/security/csp-edge";

const { auth } = NextAuth(authConfig);

const locales = ['en', 'es', 'it'];
const defaultLocale = 'en';

export default auth(async (req) => {
    const isLoggedIn = !!req.auth;
    const { nextUrl } = req;
    const { pathname, search } = nextUrl;

    // --- 1. EDGE SECURITY GATE ---
    // Evaluate the Token Bucket natively at the CDN Edge.
    const ip = (req.headers.get("x-forwarded-for") || "unknown").toString();
    const isAllowed = await checkEdgeRateLimit(ip, 20, 60);

    if (!isAllowed) {
        return new NextResponse("Network Intercept: Rate Limit Breached.", { status: 429 });
    }

    // --- 1.5 DOMAIN SHIELD GATE ---
    const edgeConfig = await getEdgeConfig();
    const referrer = req.headers.get("referer") || "";

    const shieldResponse = checkDomainShield(referrer, edgeConfig.domainShield);
    if (shieldResponse) return shieldResponse;

    // --- 2. HARDWARE ENTROPY GATE (L3 Stability) ---
    // When the MCP detects S_hw > 0.8 on the iMac, it writes to edge-accessible cache or env.
    // This allows the proxy to shed load and block non-essential logic paths.
    const isCoolingMode = process.env.LOGOS_SUBSTRATE_COOLING === "ACTIVE";
    if (isCoolingMode && !pathname.startsWith('/api') && !pathname.includes('/auth')) {
        return new NextResponse("Substrate Cooling: Hardware entropy exceeds safe limits (Narrow Gate Active).", { status: 503 });
    }

    // --- 2.2 INFRASTRUCTURE HALTING GATE ---
    const isAdmin = locales.some(loc => pathname.startsWith(`/${loc}/admin`)) || pathname.startsWith('/admin');
    const isAuth = pathname.includes('/auth');
    if (edgeConfig.haltingProtocol && !isAdmin && !isAuth && !pathname.startsWith('/api')) {
        return new NextResponse("System Halted: Infrastructure Maintenance in Progress.", { status: 503 });
    }

    // --- NONCE GENERATION & CSP ---
    const { nonce, cspHeader } = generateCSP();

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('Content-Security-Policy', cspHeader);

    // --- 3.5 EDGE FEATURE FLAGS ---
    // Retrieve feature flags natively from Edge architecture (Redis) before hitting Node.
    const edgeFlags = await getEdgeFeatureFlags(req.auth?.user?.id ?? null);
    requestHeaders.set('x-feature-flags', JSON.stringify(edgeFlags));

    // Create the baseline response integrating the patched headers
    let response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    response.headers.set('Content-Security-Policy', cspHeader);

    // --- 3.7 MANDATORY SECURITY HEADERS ---
    const hsts = `max-age=${SECURITY_CONFIG.HEADERS.HSTS_MAX_AGE}${SECURITY_CONFIG.HEADERS.HSTS_INCLUDE_SUBDOMAINS ? '; includeSubDomains' : ''}${SECURITY_CONFIG.HEADERS.HSTS_PRELOAD ? '; preload' : ''}`;
    response.headers.set('Strict-Transport-Security', hsts);
    response.headers.set('Referrer-Policy', SECURITY_CONFIG.HEADERS.REFERRER_POLICY);
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // --- 4. AXIOMATIC AUTH & LOCALIZATION ---
    const isRootAdmin = req.auth?.user?.role === "ADMIN" || req.auth?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    // Check if the route is an admin route (e.g., /en/admin, /admin)
    const isAdminRoute = locales.some(loc => pathname.startsWith(`/${loc}/admin`)) || pathname.startsWith('/admin');
    const isDashboardRoute = locales.some(loc => pathname.startsWith(`/${loc}/dashboard`)) || pathname.startsWith('/dashboard');

    if (isAdminRoute) {
        if (!isLoggedIn) {
            response = NextResponse.redirect(new URL(`/${defaultLocale}/auth/handshake?callbackUrl=${encodeURIComponent(pathname)}`, req.url));
            response.headers.set('Content-Security-Policy', cspHeader);
            return response;
        }

        if (!isRootAdmin) {
            response = NextResponse.redirect(new URL(`/${defaultLocale}/dashboard?error=Access_Denied_Root_Clearance_Required`, req.url));
            response.headers.set('Content-Security-Policy', cspHeader);
            return response;
        }
    }

    if (isDashboardRoute && !isLoggedIn) {
        response = NextResponse.redirect(new URL(`/${defaultLocale}/auth/handshake?callbackUrl=${encodeURIComponent(pathname)}`, req.url));
        response.headers.set('Content-Security-Policy', cspHeader);
        return response;
    }

    // --- LOCALIZATION REWRITE LOGIC ---
    const pathnameIsMissingLocale = locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    if (pathnameIsMissingLocale && !pathname.startsWith('/api')) {
        response = NextResponse.redirect(new URL(`/${defaultLocale}${pathname}${search}`, req.url));
        response.headers.set('Content-Security-Policy', cspHeader);
        return response;
    }

    // Redirect already authenticated users away from the Handshake gateway
    const isHandshake = locales.some(loc => pathname === `/${loc}/auth/handshake`) || pathname === '/auth/handshake';
    if (isLoggedIn && isHandshake) {
        response = NextResponse.redirect(new URL(`/${defaultLocale}/`, req.url));
        response.headers.set('Content-Security-Policy', cspHeader);
        return response;
    }

    return response;
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
