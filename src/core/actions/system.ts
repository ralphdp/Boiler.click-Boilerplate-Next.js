"use server";

import { getAdminAuth, getAdminDb } from "@/core/firebase/admin";
import { auth } from "@/core/auth";
import { cookies } from "next/headers";
import { updateEdgeConfig } from "@/core/security/edge-config";
import { logAuditTrace } from "./nodes";

export async function verifySovereignCipher(cipher: string) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    const systemCipher = process.env.SOVEREIGN_CIPHER || "21170194";
    const isValid = cipher === systemCipher;

    if (isValid) {
        await logAuditTrace("CIPHER_AUTH", "INFO", "Sovereign Cipher Authenticated", session?.user?.email || "SYSTEM");
    } else {
        await logAuditTrace("CIPHER_FAILURE", "CRIT", "Invalid Cipher attempt detected", session?.user?.email || "SYSTEM");
    }

    return { success: isValid };
}

export async function getTelemetryData() {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    const start = Date.now();
    let status = {
        latency: 0,
        firebaseSync: "NOMINAL",
        resendTransport: "PROTECTED",
        stripeBridge: "PROTECTED",
        redisEdge: "PROTECTED",
        posthogPulse: "PROTECTED"
    };

    if (isRootAdmin) {
        try {
            const authAdmin = getAdminAuth();
            await authAdmin.listUsers(1);
            status.firebaseSync = "NOMINAL";
        } catch (e) {
            console.error("[Telemetry] Firebase FAULT", e);
            status.firebaseSync = "FAULT";
        }
        status.resendTransport = process.env.RESEND_API_KEY ? "NOMINAL" : "OFFLINE";
        status.stripeBridge = process.env.STRIPE_SECRET_KEY ? "NOMINAL" : "OFFLINE";
        status.redisEdge = process.env.UPSTASH_REDIS_REST_URL ? "NOMINAL" : "OFFLINE";
        status.posthogPulse = (process.env.NEXT_PUBLIC_POSTHOG_KEY || "") ? "NOMINAL" : "UNSET";
    }

    status.latency = Date.now() - start;
    return status;
}

/**
 * PRO-G40 BRIDGE: Deep-Parse the Logos Total Corpus
 * Returns relevant 'Jewels' matching the query.
 */
export async function deepParseCorpus(query: string) {
    const session = await auth();
    if (!session) throw new Error("UNAUTHORIZED: Handshake Required.");

    const path = require('path');
    const CORPUS_PATH = path.resolve(process.cwd(), process.env.LOGOS_CORPUS_PATH || "src/core/knowledge/corpus.md");

    try {
        const fs = await import("fs");
        if (!fs.existsSync(CORPUS_PATH)) {
            return { success: false, error: "Bridge path offline." };
        }

        const content = fs.readFileSync(CORPUS_PATH, "utf-8");
        const jewels = content.split("--- JEWEL:");

        const results = jewels.filter(j => j.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 5)
            .map(j => "--- JEWEL:" + j.trim());

        return { success: true, results };
    } catch (e: any) {
        console.error("[PRO-G40 Bridge Fault]:", e);
        return { success: false, error: "Bridge failure: " + e.message };
    }
}

export async function setSovereignWebGLVariant(variant: 'matrix' | 'fire' | 'galaxy' | 'none') {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    if (!isRootAdmin) {
        throw new Error("UNAUTHORIZED_ACCESS: Clearance level insufficient.");
    }

    try {
        const rootCookieStore = await cookies();
        rootCookieStore.set("sovereign_webgl_variant", variant, { path: "/", maxAge: 60 * 60 * 24 * 365, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
        await logAuditTrace("AESTHETIC_OVERRIDE", "INFO", "Updated WebGL variant", session?.user?.email || "SYSTEM", "RECURSION");
        return { success: true };
    } catch (e: any) {
        console.error("[WebGL Global Override Fault]:", e);
        return { error: true, message: "Aesthetic override failed to propagate." };
    }
}

import { FACTORY_DEFAULTS } from "@/core/config/defaults";

export async function getGlobalOverrides() {
    try {
        const rootCookieStore = await cookies();
        const activeVariant = (rootCookieStore.get("sovereign_webgl_variant")?.value || "fire") as string;

        const db = getAdminDb();
        const doc = await db.collection("sovereign_config").doc("global").get();
        const data = doc.data() || {};

        return {
            broadcast: data.broadcast || "",
            broadcastUrgency: data.broadcastUrgency || "INFO",
            typography: data.typography || "",
            commerceMode: data.commerceMode || process.env.COMMERCE_MODE || FACTORY_DEFAULTS.commerceMode,
            resendFrom: data.resendFrom || process.env.RESEND_DEFAULT_FROM || FACTORY_DEFAULTS.resendFrom,
            siteTitle: data.siteTitle !== undefined ? data.siteTitle : FACTORY_DEFAULTS.siteTitle,
            contactEmail: data.contactEmail !== undefined ? data.contactEmail : FACTORY_DEFAULTS.contactEmail,
            primaryColor: data.primaryColor || FACTORY_DEFAULTS.primaryColor,
            haltingProtocol: data.haltingProtocol !== undefined ? !!data.haltingProtocol : FACTORY_DEFAULTS.haltingProtocol,
            preLaunchMode: data.preLaunchMode !== undefined ? !!data.preLaunchMode : FACTORY_DEFAULTS.preLaunchMode,
            socialX: data.socialX !== undefined ? data.socialX : FACTORY_DEFAULTS.socialX,
            socialGithub: data.socialGithub !== undefined ? data.socialGithub : FACTORY_DEFAULTS.socialGithub,
            socialDiscord: data.socialDiscord !== undefined ? data.socialDiscord : FACTORY_DEFAULTS.socialDiscord,
            seoDescription: data.seoDescription !== undefined ? data.seoDescription : FACTORY_DEFAULTS.siteDescription,
            seoKeywords: data.seoKeywords || "",
            seoOgImage: data.seoOgImage || "",
            rateLimitMode: data.rateLimitMode || "standard",
            gaId: data.gaId !== undefined ? data.gaId : (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ""),
            gaPropertyId: data.gaPropertyId !== undefined ? data.gaPropertyId : (process.env.GA_PROPERTY_ID || ""),
            posthogId: data.posthogId !== undefined ? data.posthogId : "",
            pricingTiers: data.pricingTiers && data.pricingTiers.length > 0 ? data.pricingTiers : FACTORY_DEFAULTS.pricingTiers,
            recommendedPlan: data.recommendedPlan || FACTORY_DEFAULTS.recommendedPlan,
            webglVariant: activeVariant.toLowerCase(),
            sandboxMode: !!data.sandboxMode,
            mfaEnforced: !!data.mfaEnforced,
            domainShield: !!data.domainShield,
            modules: data.modules || FACTORY_DEFAULTS.modules
        };
    } catch (e: any) {
        return {
            broadcast: "",
            broadcastUrgency: "INFO",
            typography: "",
            commerceMode: process.env.COMMERCE_MODE || FACTORY_DEFAULTS.commerceMode,
            resendFrom: process.env.RESEND_DEFAULT_FROM || FACTORY_DEFAULTS.resendFrom,
            siteTitle: FACTORY_DEFAULTS.siteTitle,
            contactEmail: FACTORY_DEFAULTS.contactEmail,
            primaryColor: FACTORY_DEFAULTS.primaryColor,
            haltingProtocol: FACTORY_DEFAULTS.haltingProtocol,
            preLaunchMode: FACTORY_DEFAULTS.preLaunchMode,
            socialX: FACTORY_DEFAULTS.socialX,
            socialGithub: FACTORY_DEFAULTS.socialGithub,
            socialDiscord: FACTORY_DEFAULTS.socialDiscord,
            seoDescription: FACTORY_DEFAULTS.siteDescription,
            seoKeywords: "",
            seoOgImage: "",
            rateLimitMode: "standard",
            gaId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "",
            gaPropertyId: process.env.GA_PROPERTY_ID || "",
            posthogId: "",
            pricingTiers: FACTORY_DEFAULTS.pricingTiers,
            recommendedPlan: FACTORY_DEFAULTS.recommendedPlan,
            webglVariant: "fire",
            sandboxMode: false,
            mfaEnforced: false,
            modules: FACTORY_DEFAULTS.modules
        };
    }
}

export async function setGlobalBroadcast(message: string, urgency: 'INFO' | 'WARN' | 'CRIT' = 'INFO') {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    if (!isRootAdmin) {
        throw new Error("UNAUTHORIZED_ACCESS: Clearance level insufficient.");
    }

    try {
        const db = getAdminDb();
        await db.collection("sovereign_config").doc("global").set({
            broadcast: message || "",
            broadcastUrgency: urgency
        }, { merge: true });
        await logAuditTrace("BROADCAST_UPDATE", "INFO", `Updated global broadcast (${urgency})`, session?.user?.email || "SYSTEM", "UNITY");
        return { success: true };
    } catch (e: any) {
        return { error: true, message: "Broadcast failed." };
    }
}

export async function setContentOverride(tagline: string) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    try {
        const db = getAdminDb();
        await db.collection("sovereign_config").doc("global").set({ typography: tagline || "" }, { merge: true });
        await logAuditTrace("CONTENT_OVERRIDE", "INFO", "Updated content overrides", session?.user?.email || "SYSTEM", "RECURSION");
        return { success: true };
    } catch (e: any) {
        return { error: true };
    }
}

export async function setSandboxMode(mode: boolean) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    try {
        const db = getAdminDb();
        await db.collection("sovereign_config").doc("global").set({ sandboxMode: mode }, { merge: true });
        await logAuditTrace("MODE_CHANGE", "WARN", "Toggled sandbox mode", session?.user?.email || "SYSTEM", "PARSIMONY");
        return { success: true };
    } catch (e: any) {
        return { error: true };
    }
}

export async function setMFAEnforced(enforced: boolean) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    try {
        const db = getAdminDb();
        await db.collection("sovereign_config").doc("global").set({ mfaEnforced: enforced }, { merge: true });
        await logAuditTrace("MFA_ENFORCE_TOGGLE", "WARN", `Toggled workspace MFA enforcement to ${enforced}`, session?.user?.email || "SYSTEM", "UNITY");
        return { success: true };
    } catch (e: any) {
        return { error: true };
    }
}

export async function setSiteTitle(title: string) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    try {
        const db = getAdminDb();
        await db.collection("sovereign_config").doc("global").set({ siteTitle: title || "" }, { merge: true });
        await logAuditTrace("BRANDING_UPDATE", "INFO", "Updated site title", session?.user?.email || "SYSTEM", "UNITY");
        return { success: true };
    } catch (e: any) {
        return { error: true };
    }
}

export async function setContactEmail(email: string) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    try {
        const db = getAdminDb();
        await db.collection("sovereign_config").doc("global").set({ contactEmail: email || "" }, { merge: true });
        await logAuditTrace("BRANDING_UPDATE", "INFO", "Updated contact email", session?.user?.email || "SYSTEM", "UNITY");
        return { success: true };
    } catch (e: any) {
        return { error: true };
    }
}

export async function setResendFrom(email: string) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    try {
        const db = getAdminDb();
        await db.collection("sovereign_config").doc("global").set({ resendFrom: email }, { merge: true });
        await logAuditTrace("EMAIL_CONFIG", "WARN", "Updated Resend origin email", session?.user?.email || "SYSTEM", "UNITY");
        return { success: true };
    } catch (e: any) {
        return { error: true };
    }
}

export async function setHaltingProtocol(isActive: boolean) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    try {
        await getAdminDb().collection("sovereign_config").doc("global").set({ haltingProtocol: isActive }, { merge: true });
        await updateEdgeConfig({ haltingProtocol: isActive });
        await logAuditTrace("HALT_PROTOCOL", "CRIT", "Toggled global halting protocol", session?.user?.email || "SYSTEM", "UNITY");
        return { success: true };
    } catch (e: any) {
        return { error: true };
    }
}

export async function setPreLaunchMode(isActive: boolean) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    try {
        await getAdminDb().collection("sovereign_config").doc("global").set({ preLaunchMode: isActive }, { merge: true });
        await updateEdgeConfig({ preLaunchMode: isActive });
        await logAuditTrace("MODE_CHANGE", "WARN", "Toggled pre-launch mode", session?.user?.email || "SYSTEM", "UNITY");
        return { success: true };
    } catch (e: any) {
        return { error: true };
    }
}

export async function setDomainShield(isActive: boolean) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    try {
        await getAdminDb().collection("sovereign_config").doc("global").set({ domainShield: isActive }, { merge: true });
        await updateEdgeConfig({ domainShield: isActive });
        await logAuditTrace("SECURITY_UPDATE", "WARN", `Toggled Domain Shield: ${isActive}`, session?.user?.email || "SYSTEM", "UNITY");
        return { success: true };
    } catch (e: any) {
        return { error: true };
    }
}

export async function setPrimaryColor(colorHex: string) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    try {
        await getAdminDb().collection("sovereign_config").doc("global").set({ primaryColor: colorHex }, { merge: true });
        await logAuditTrace("BRANDING_UPDATE", "INFO", "Updated primary brand color", session?.user?.email || "SYSTEM", "RECURSION");
        return { success: true };
    } catch (e: any) {
        return { error: true };
    }
}

export async function setSocialLinks(socials: { socialX?: string, socialGithub?: string, socialDiscord?: string }) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    try {
        await getAdminDb().collection("sovereign_config").doc("global").set(socials, { merge: true });
        await logAuditTrace("BRANDING_UPDATE", "INFO", "Updated social navigation links", session?.user?.email || "SYSTEM", "RECURSION");
        return { success: true };
    } catch (e: any) {
        return { error: true };
    }
}

export async function setSEOMetadata(data: { description: string, keywords: string, ogUrl: string }) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    const db = getAdminDb();
    await db.collection("sovereign_config").doc("global").set({ seoDescription: data.description || "", seoKeywords: data.keywords || "", seoOgImage: data.ogUrl || "" }, { merge: true });
    await logAuditTrace("SEO_UPDATE", "INFO", "Updated SEO metadata", session?.user?.email || "SYSTEM", "UNITY");
    return { success: true };
}

export async function setRateLimitMode(mode: string) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    const db = getAdminDb();
    await db.collection("sovereign_config").doc("global").set({ rateLimitMode: mode }, { merge: true });
    await logAuditTrace("SECURITY_UPDATE", "CRIT", "Adjusted rate limit strictness", session?.user?.email || "SYSTEM", "PARSIMONY");
    return { success: true };
}

export async function setTelemetryKeys(data: { gaId?: string, gaPropertyId?: string, posthogId?: string }) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    const db = getAdminDb();
    const updates: any = {};
    if (data.gaId !== undefined) updates.gaId = data.gaId;
    if (data.gaPropertyId !== undefined) updates.gaPropertyId = data.gaPropertyId;
    if (data.posthogId !== undefined) updates.posthogId = data.posthogId;

    await db.collection("sovereign_config").doc("global").set(updates, { merge: true });
    await logAuditTrace("TELEMETRY_UPDATE", "WARN", "Updated analytics tracking keys", session?.user?.email || "SYSTEM", "UNITY");
    return { success: true };
}

export async function updateGlobalModules(modules: any) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    const db = getAdminDb();
    await db.collection("sovereign_config").doc("global").set({ modules }, { merge: true });
    await logAuditTrace("MODULE_UPDATE", "WARN", "Updated global module governance flags", session?.user?.email || "SYSTEM", "UNITY");
    return { success: true };
}

export async function getSEOMatrix() {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    const db = getAdminDb();
    const snap = await db.collection("sovereign_seo_matrix").get();
    return snap.docs.map(doc => ({
        route: doc.id.replace(/_/g, '/'),
        ...doc.data()
    }));
}

export async function updateSEORoute(route: string, data: { title?: string, description?: string, keywords?: string, ogImage?: string, noIndex?: boolean }) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    const db = getAdminDb();
    const docId = route.replace(/\//g, '_') || "home";

    if (!data.title && !data.description && !data.keywords && !data.ogImage && data.noIndex === undefined) {
        await db.collection("sovereign_seo_matrix").doc(docId).delete();
        await logAuditTrace("SEO_MATRIX_DELETE", "WARN", `Removed SEO override for route: ${route}`, session?.user?.email || "SYSTEM", "PARSIMONY");
    } else {
        await db.collection("sovereign_seo_matrix").doc(docId).set(data, { merge: true });
        await logAuditTrace("SEO_MATRIX_UPDATE", "INFO", `Updated SEO override for route: ${route}`, session?.user?.email || "SYSTEM", "UNITY");
    }

    return { success: true };
}
