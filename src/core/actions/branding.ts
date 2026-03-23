"use server";
import { getAdminDb, getCollectionName } from "@/core/firebase/admin";
import { auth } from "@/core/auth";
import { logAuditTrace } from "./nodes";
import { cookies } from "next/headers";
import { FACTORY_DEFAULTS } from "@/core/config/defaults";

export async function setSiteTitle(title: string) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    try {
        const db = getAdminDb();
        await db.collection(getCollectionName("sovereign_config")).doc("global").set({ siteTitle: title || "" }, { merge: true });
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
        await db.collection(getCollectionName("sovereign_config")).doc("global").set({ contactEmail: email || "" }, { merge: true });
        await logAuditTrace("BRANDING_UPDATE", "INFO", "Updated contact email", session?.user?.email || "SYSTEM", "UNITY");
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
        await getAdminDb().collection(getCollectionName("sovereign_config")).doc("global").set({ primaryColor: colorHex }, { merge: true });
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
        await getAdminDb().collection(getCollectionName("sovereign_config")).doc("global").set(socials, { merge: true });
        await logAuditTrace("BRANDING_UPDATE", "INFO", "Updated social navigation links", session?.user?.email || "SYSTEM", "RECURSION");
        return { success: true };
    } catch (e: any) {
        return { error: true };
    }
}

export async function setGlobalBroadcast(message: string) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    try {
        await getAdminDb().collection(getCollectionName("sovereign_config")).doc("global").set({ globalBroadcast: message }, { merge: true });
        await logAuditTrace("BROADCAST_UPDATE", "WARN", `Updated global broadcast: ${message || "CLEARED"}`, session?.user?.email || "SYSTEM", "UNITY");
        return { success: true };
    } catch (e: any) {
        return { error: true };
    }
}

export async function setSandboxMode(enabled: boolean) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    try {
        await getAdminDb().collection(getCollectionName("sovereign_config")).doc("global").set({ sandboxMode: enabled }, { merge: true });
        await logAuditTrace("CONFIG_UPDATE", "WARN", `Toggled sandbox mode to ${enabled}`, session?.user?.email || "SYSTEM", "PARSIMONY");
        return { success: true };
    } catch (e: any) {
        return { error: true };
    }
}

export async function setPreLaunchMode(enabled: boolean) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    try {
        await getAdminDb().collection(getCollectionName("sovereign_config")).doc("global").set({ preLaunchMode: enabled }, { merge: true });
        await logAuditTrace("CONFIG_UPDATE", "WARN", `Toggled pre-launch mode to ${enabled}`, session?.user?.email || "SYSTEM", "PARSIMONY");
        return { success: true };
    } catch (e: any) {
        return { error: true };
    }
}

export async function setHaltingProtocol(enabled: boolean) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    try {
        await getAdminDb().collection(getCollectionName("sovereign_config")).doc("global").set({ maintenanceMode: enabled }, { merge: true });
        await logAuditTrace("CONFIG_UPDATE", "CRIT", `Toggled maintenance mode to ${enabled}`, session?.user?.email || "SYSTEM", "PARSIMONY");
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
        await getAdminDb().collection(getCollectionName("sovereign_config")).doc("global").set({ senderEmail: email }, { merge: true });
        await logAuditTrace("CONFIG_UPDATE", "INFO", "Updated system sender email", session?.user?.email || "SYSTEM", "UNITY");
        return { success: true };
    } catch (e: any) {
        return { error: true };
    }
}

export async function setContentOverride(content: string) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    try {
        await getAdminDb().collection(getCollectionName("sovereign_config")).doc("global").set({ typography: content }, { merge: true });
        await logAuditTrace("BRANDING_UPDATE", "INFO", "Updated typography/content override", session?.user?.email || "SYSTEM", "RECURSION");
        return { success: true };
    } catch (e: any) {
        return { error: true };
    }
}

export async function setSEOMetadata(meta: { description: string, keywords: string, ogUrl: string }) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    try {
        await getAdminDb().collection(getCollectionName("sovereign_config")).doc("global").set({ seoDescription: meta.description, seoKeywords: meta.keywords, seoOgImage: meta.ogUrl }, { merge: true });
        await logAuditTrace("SEO_UPDATE", "INFO", "Updated global SEO metadata", session?.user?.email || "SYSTEM", "RECURSION");
        return { success: true };
    } catch (e: any) {
        return { error: true };
    }
}

export async function setSovereignWebGLVariant(variant: 'matrix' | 'fire' | 'galaxy' | 'none') {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    try {
        await getAdminDb().collection(getCollectionName("sovereign_config")).doc("global").set({ webglVariant: variant }, { merge: true });
        await logAuditTrace("BRANDING_UPDATE", "INFO", `Updated WebGL shader variant to ${variant}`, session?.user?.email || "SYSTEM", "RECURSION");
        return { success: true };
    } catch (e: any) {
        return { error: true };
    }
}

export async function updateGlobalModules(modules: string[]) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    try {
        await getAdminDb().collection(getCollectionName("sovereign_config")).doc("global").set({ activeModules: modules }, { merge: true });
        await logAuditTrace("CONFIG_UPDATE", "WARN", "Updated active system modules", session?.user?.email || "SYSTEM", "PARSIMONY");
        return { success: true };
    } catch (e: any) {
        return { error: true };
    }
}

export async function getSEOMatrix() {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) return [];

    try {
        const snapshot = await getAdminDb().collection(getCollectionName("sovereign_seo")).get();
        return snapshot.docs.map(doc => ({
            route: doc.id.replace(/_/g, "/"),
            ...doc.data()
        }));
    } catch (e: any) {
        return [];
    }
}

export async function updateSEORoute(route: string, tags: any) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    try {
        await getAdminDb().collection(getCollectionName("sovereign_seo")).doc(route.replace(/\//g, "_")).set(tags, { merge: true });
        await logAuditTrace("SEO_UPDATE", "INFO", `Updated SEO tags for route: ${route}`, session?.user?.email || "SYSTEM", "RECURSION");
        return { success: true };
    } catch (e: any) {
        return { error: true };
    }
}
export async function getGlobalOverrides() {
    try {
        const rootCookieStore = await cookies();
        const activeVariant = (rootCookieStore.get("sovereign_webgl_variant")?.value || "fire") as string;

        const db = getAdminDb();
        const doc = await db.collection(getCollectionName("sovereign_config")).doc("global").get();
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
