"use server";

import { getAdminAuth, getAdminDb } from "@/core/firebase/admin";
import { auth } from "@/core/auth";
import { Resend } from "resend";
import { cookies } from "next/headers";


export async function logAuditTrace(action: string, severity: 'INFO' | 'WARN' | 'CRIT', message: string, user: string = "SYSTEM") {
    try {
        const db = getAdminDb();
        await db.collection("omni_audit_traces").add({
            action,
            severity,
            message,
            timestamp: Date.now(),
            user
        });
    } catch (e) {
        console.error("Failed to log audit trace:", e);
    }
}

export async function getSovereignNodes(maxResults = 100) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    if (!isRootAdmin) {
        throw new Error("UNAUTHORIZED_ACCESS: Clearance level insufficient.");
    }

    try {
        const authAdmin = getAdminAuth();
        const listUsersResult = await authAdmin.listUsers(maxResults);

        return listUsersResult.users.map(u => ({
            uid: u.uid,
            email: u.email,
            displayName: u.displayName || "Unknown Node",
            creationTime: u.metadata.creationTime,
            lastSignInTime: u.metadata.lastSignInTime,
            provider: u.providerData[0]?.providerId || "native",
            customClaims: u.customClaims || {},
            disabled: u.disabled
        }));
    } catch (e: any) {
        console.error("[Admin Substrate Error]:", e);
        throw new Error("Failed to retrieve node mapping. See logs.");
    }
}

export async function setNodeStatus(uid: string, disabled: boolean) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    if (!isRootAdmin) {
        throw new Error("UNAUTHORIZED_ACCESS: Only existing Root Administrators can alter node status.");
    }

    try {
        const authAdmin = getAdminAuth();
        await authAdmin.updateUser(uid, { disabled });
        await logAuditTrace("NODE_STATUS_CHANGE", "CRIT", disabled ? "Node banned" : "Node authorized", session?.user?.email || "SYSTEM");
        return { success: true, message: `Node successfully ${disabled ? 'banned' : 'authorized'}.` };
    } catch (e: any) {
        console.error("[Admin Node Status Fault]:", e);
        return { error: true, message: "Status update failed. Node may not exist." };
    }
}

export async function setNodeRole(uid: string, role: "ADMIN" | "USER") {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    if (!isRootAdmin) {
        throw new Error("UNAUTHORIZED_ACCESS: Only existing Root Administrators can escalate nodes.");
    }

    try {
        const authAdmin = getAdminAuth();
        await authAdmin.setCustomUserClaims(uid, { role });
        await logAuditTrace("NODE_ESCALATION", "WARN", "Changed node role", session?.user?.email || "SYSTEM");
        return { success: true, message: `Node successfully updated to ${role}.` };
    } catch (e: any) {
        console.error("[Admin Escalation Fault]:", e);
        return { error: true, message: "Escalation failed. Node may not exist." };
    }
}

export async function getTelemetryData() {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    if (!isRootAdmin) {
        throw new Error("UNAUTHORIZED_ACCESS: Clearance level insufficient.");
    }

    const start = Date.now();
    let firebaseSync = "FAULT";
    let resendStatus = process.env.RESEND_API_KEY ? "ONLINE" : "OFFLINE";
    let stripeStatus = process.env.STRIPE_SECRET_KEY ? "ONLINE" : "OFFLINE";
    let redisStatus = process.env.UPSTASH_REDIS_REST_URL ? "ONLINE" : "OFFLINE";

    try {
        // Ping Firebase Admin Auth to measure latency and test sync state
        const authAdmin = getAdminAuth();
        await authAdmin.listUsers(1);
        firebaseSync = "NOMINAL";
    } catch (e) {
        console.error("[Telemetry] Firebase FAULT", e);
    }
    const latency = Date.now() - start;

    return {
        latency,
        firebaseSync,
        resendTransport: resendStatus,
        stripeBridge: stripeStatus,
        redisEdge: redisStatus
    };
}

export async function setSovereignWebGLVariant(variant: 'matrix' | 'fire' | 'galaxy' | 'none') {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    if (!isRootAdmin) {
        throw new Error("UNAUTHORIZED_ACCESS: Clearance level insufficient to execute systemic aesthetic overwrite.");
    }

    try {
        const rootCookieStore = await cookies();
        rootCookieStore.set("sovereign_webgl_variant", variant, { path: "/", maxAge: 60 * 60 * 24 * 365, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
        await logAuditTrace("AESTHETIC_OVERRIDE", "INFO", "Updated WebGL variant", session?.user?.email || "SYSTEM");
        return { success: true };
    } catch (e: any) {
        console.error("[WebGL Global Override Fault]:", e);
        return { error: true, message: "Aesthetic override failed to propagate." };
    }
}

export async function setGlobalBroadcast(message: string) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    if (!isRootAdmin) {
        throw new Error("UNAUTHORIZED_ACCESS: Clearance level insufficient.");
    }

    try {
        const db = getAdminDb();
        await db.collection("sovereign_config").doc("global").set({ broadcast: message || "" }, { merge: true });
        await logAuditTrace("BROADCAST_UPDATE", "INFO", "Updated global broadcast message", session?.user?.email || "SYSTEM");
        return { success: true };
    } catch (e: any) {
        return { error: true, message: "Broadcast failed." };
    }
}

export async function setContentOverride(tagline: string) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    if (!isRootAdmin) {
        throw new Error("UNAUTHORIZED_ACCESS: Clearance level insufficient.");
    }

    try {
        const db = getAdminDb();
        await db.collection("sovereign_config").doc("global").set({ typography: tagline || "" }, { merge: true });
        await logAuditTrace("CONTENT_OVERRIDE", "INFO", "Updated content overrides", session?.user?.email || "SYSTEM");
        return { success: true };
    } catch (e: any) {
        return { error: true, message: "Content override failed." };
    }
}

export async function getGlobalOverrides() {
    try {
        const rootCookieStore = await cookies();
        const activeVariant = (rootCookieStore.get("sovereign_webgl_variant")?.value || "fire") as string;

        const db = getAdminDb();
        const doc = await db.collection("sovereign_config").doc("global").get();
        const data = doc.data() || {};
        return {
            broadcast: data.broadcast || "",
            typography: data.typography || "",
            commerceMode: data.commerceMode || process.env.COMMERCE_MODE || "saas",
            resendFrom: data.resendFrom || process.env.RESEND_DEFAULT_FROM || "noreply@boiler.click",
            siteTitle: data.siteTitle || "",
            contactEmail: data.contactEmail || "",
            primaryColor: data.primaryColor || "",
            haltingProtocol: !!data.haltingProtocol,
            preLaunchMode: !!data.preLaunchMode,
            socialX: data.socialX || "",
            socialGithub: data.socialGithub || "",
            socialDiscord: data.socialDiscord || "",
            seoDescription: data.seoDescription || "",
            seoKeywords: data.seoKeywords || "",
            seoOgImage: data.seoOgImage || "",
            rateLimitMode: data.rateLimitMode || "standard",
            gaId: data.gaId || "",
            posthogId: data.posthogId || "",
            pricingTiers: data.pricingTiers || [{ "id": "basic", "name": "Basic Node", "price": "9", "features": ["Standard Telemetry", "Email Support", "Priority Access"], "buttonText": "Initialize Basic" }, { "id": "pro", "name": "Pro Node", "price": "99", "features": ["Advanced Telemetry", "24/7 Priority Support", "Full Admin Access"], "buttonText": "Initialize Pro" }],
            recommendedPlan: data.recommendedPlan || "pro",
            webglVariant: activeVariant,
            sandboxMode: !!data.sandboxMode
        };
    } catch (e: any) {
        return {
            broadcast: "",
            typography: "",
            commerceMode: process.env.COMMERCE_MODE || "saas",
            resendFrom: process.env.RESEND_DEFAULT_FROM || "noreply@boiler.click",
            siteTitle: "",
            contactEmail: "",
            primaryColor: "",
            haltingProtocol: false,
            preLaunchMode: false,
            socialX: "",
            socialGithub: "",
            socialDiscord: "",
            seoDescription: "",
            seoKeywords: "",
            seoOgImage: "",
            rateLimitMode: "standard",
            gaId: "",
            posthogId: "",
            pricingTiers: [{ "id": "basic", "name": "Basic Node", "price": "9", "features": ["Standard Telemetry", "Email Support", "Priority Access"], "buttonText": "Initialize Basic" }, { "id": "pro", "name": "Pro Node", "price": "99", "features": ["Advanced Telemetry", "24/7 Priority Support", "Full Admin Access"], "buttonText": "Initialize Pro" }],
            recommendedPlan: "pro",
            webglVariant: "fire",
            sandboxMode: false
        };
    }
}

export async function setSandboxMode(mode: boolean) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    if (!isRootAdmin) {
        throw new Error("UNAUTHORIZED_ACCESS: Clearance level insufficient.");
    }

    try {
        const db = getAdminDb();
        await db.collection("sovereign_config").doc("global").set({ sandboxMode: mode }, { merge: true });
        await logAuditTrace("MODE_CHANGE", "WARN", "Toggled sandbox mode", session?.user?.email || "SYSTEM");
        return { success: true };
    } catch (e: any) {
        return { error: true, message: "Sandbox mode toggle failed." };
    }
}

export async function setSiteTitle(title: string) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    if (!isRootAdmin) {
        throw new Error("UNAUTHORIZED_ACCESS: Clearance level insufficient.");
    }

    try {
        const db = getAdminDb();
        await db.collection("sovereign_config").doc("global").set({ siteTitle: title || "" }, { merge: true });
        await logAuditTrace("BRANDING_UPDATE", "INFO", "Updated site title", session?.user?.email || "SYSTEM");
        return { success: true };
    } catch (e: any) {
        return { error: true, message: "Site title override failed." };
    }
}

export async function setContactEmail(email: string) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    if (!isRootAdmin) {
        throw new Error("UNAUTHORIZED_ACCESS: Clearance level insufficient.");
    }

    try {
        const db = getAdminDb();
        await db.collection("sovereign_config").doc("global").set({ contactEmail: email || "" }, { merge: true });
        await logAuditTrace("BRANDING_UPDATE", "INFO", "Updated contact email", session?.user?.email || "SYSTEM");
        return { success: true };
    } catch (e: any) {
        return { error: true, message: "Contact email override failed." };
    }
}

export async function setCommerceMode(mode: string) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    if (!isRootAdmin) {
        throw new Error("UNAUTHORIZED_ACCESS: Clearance level insufficient.");
    }

    try {
        const db = getAdminDb();
        await db.collection("sovereign_config").doc("global").set({ commerceMode: mode }, { merge: true });
        await logAuditTrace("COMMERCE_UPDATE", "INFO", "Changed commerce mode", session?.user?.email || "SYSTEM");
        return { success: true };
    } catch (e: any) {
        return { error: true, message: "Commerce override failed." };
    }
}

export async function setResendFrom(email: string) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    if (!isRootAdmin) {
        throw new Error("UNAUTHORIZED_ACCESS: Clearance level insufficient.");
    }

    try {
        const db = getAdminDb();
        await db.collection("sovereign_config").doc("global").set({ resendFrom: email }, { merge: true });
        await logAuditTrace("EMAIL_CONFIG", "WARN", "Updated Resend origin email", session?.user?.email || "SYSTEM");
        return { success: true };
    } catch (e: any) {
        return { error: true, message: "Resend email override failed." };
    }
}

export async function setHaltingProtocol(isActive: boolean) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    if (!isRootAdmin) throw new Error("UNAUTHORIZED_ACCESS: Clearance level insufficient.");

    try {
        await getAdminDb().collection("sovereign_config").doc("global").set({ haltingProtocol: isActive }, { merge: true });
        await logAuditTrace("HALT_PROTOCOL", "CRIT", "Toggled global halting protocol", session?.user?.email || "SYSTEM");
        return { success: true };
    } catch (e: any) {
        return { error: true, message: "Halting protocol override failed." };
    }
}

export async function setPreLaunchMode(isActive: boolean) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    if (!isRootAdmin) throw new Error("UNAUTHORIZED_ACCESS: Clearance level insufficient.");

    try {
        await getAdminDb().collection("sovereign_config").doc("global").set({ preLaunchMode: isActive }, { merge: true });
        await logAuditTrace("MODE_CHANGE", "WARN", "Toggled pre-launch mode", session?.user?.email || "SYSTEM");
        return { success: true };
    } catch (e: any) {
        return { error: true, message: "Pre-Launch override failed." };
    }
}

export async function setPrimaryColor(colorHex: string) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    if (!isRootAdmin) throw new Error("UNAUTHORIZED_ACCESS: Clearance level insufficient.");

    try {
        await getAdminDb().collection("sovereign_config").doc("global").set({ primaryColor: colorHex }, { merge: true });
        await logAuditTrace("BRANDING_UPDATE", "INFO", "Updated primary brand color", session?.user?.email || "SYSTEM");
        return { success: true };
    } catch (e: any) {
        return { error: true, message: "Primary Color override failed." };
    }
}

export async function setSocialLinks(socials: { socialX?: string, socialGithub?: string, socialDiscord?: string }) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    if (!isRootAdmin) throw new Error("UNAUTHORIZED_ACCESS: Clearance level insufficient.");

    try {
        await getAdminDb().collection("sovereign_config").doc("global").set(socials, { merge: true });
        await logAuditTrace("BRANDING_UPDATE", "INFO", "Updated social navigation links", session?.user?.email || "SYSTEM");
        return { success: true };
    } catch (e: any) {
        return { error: true, message: "Social Link override failed." };
    }
}

export async function getAuditTraces(limitCount = 20) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    if (!isRootAdmin) {
        throw new Error("UNAUTHORIZED_ACCESS: Clearance level insufficient.");
    }

    try {
        const db = getAdminDb();
        const snapshot = await db.collection("omni_audit_traces")
            .orderBy("timestamp", "desc")
            .limit(limitCount)
            .get();

        if (snapshot.empty) { return []; }

        return snapshot.docs.map(d => ({
            id: d.id,
            action: d.data().action || "UNKNOWN",
            severity: d.data().severity || "INFO",
            message: d.data().message || "",
            timestamp: typeof d.data().timestamp === "number" ? d.data().timestamp : (d.data().timestamp?.toMillis ? d.data().timestamp.toMillis() : Date.now()),
            user: d.data().user || "SYSTEM"
        }));
    } catch (e: any) {
        console.error("[Audit Transport Error]:", e);
        return [];
    }
}

export async function setSEOMetadata(data: { description: string, keywords: string, ogUrl: string }) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");
    const db = getAdminDb();
    await db.collection("sovereign_config").doc("global").set({ seoDescription: data.description || "", seoKeywords: data.keywords || "", seoOgImage: data.ogUrl || "" }, { merge: true });
    await logAuditTrace("SEO_UPDATE", "INFO", "Updated SEO metadata", session?.user?.email || "SYSTEM");
    return { success: true };
}

export async function setRateLimitMode(mode: string) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");
    const db = getAdminDb();
    await db.collection("sovereign_config").doc("global").set({ rateLimitMode: mode }, { merge: true });
    await logAuditTrace("SECURITY_UPDATE", "CRIT", "Adjusted rate limit strictness", session?.user?.email || "SYSTEM");
    return { success: true };
}

export async function setTelemetryKeys(data: { gaId: string, posthogId: string }) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");
    const db = getAdminDb();
    await db.collection("sovereign_config").doc("global").set({ gaId: data.gaId || "", posthogId: data.posthogId || "" }, { merge: true });
    await logAuditTrace("TELEMETRY_UPDATE", "WARN", "Updated analytics tracking keys", session?.user?.email || "SYSTEM");
    return { success: true };
}

export async function setPricingMatrix(data: {
    pricingTiers: any[],
    recommendedPlan: string
}) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");
    const db = getAdminDb();
    await db.collection("sovereign_config").doc("global").set({
        pricingTiers: data.pricingTiers || [],
        recommendedPlan: data.recommendedPlan || ""
    }, { merge: true });
    await logAuditTrace("COMMERCE_UPDATE", "INFO", "Updated pricing tiers matrix", session?.user?.email || "SYSTEM");
    return { success: true };
}

export async function getStoreProducts() {
    const db = getAdminDb();
    try {
        const snap = await db.collection("store_products").get();
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        return [];
    }
}

export async function createStoreProduct(data: any) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");
    const db = getAdminDb();
    const docRef = db.collection("store_products").doc();
    await docRef.set({ ...data, createdAt: new Date().toISOString() });
    await logAuditTrace("COMMERCE_UPDATE", "INFO", "Created new store product", session?.user?.email || "SYSTEM");
    return { success: true, id: docRef.id };
}

export async function updateStoreProduct(id: string, data: any) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");
    const db = getAdminDb();
    await db.collection("store_products").doc(id).set(data, { merge: true });
    await logAuditTrace("COMMERCE_UPDATE", "INFO", "Updated store product", session?.user?.email || "SYSTEM");
    return { success: true };
}

export async function deleteStoreProduct(id: string) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");
    const db = getAdminDb();
    await db.collection("store_products").doc(id).delete();
    await logAuditTrace("COMMERCE_UPDATE", "WARN", "Deleted store product", session?.user?.email || "SYSTEM");
    return { success: true };
}
