"use server";

import { getAdminAuth, getAdminDb } from "@/core/firebase/admin";
import { auth } from "@/core/auth";
import { Resend } from "resend";
import { cookies } from "next/headers";
import { updateEdgeConfig } from "@/core/security/edge-config";


export async function logAuditTrace(
    action: string,
    severity: 'INFO' | 'WARN' | 'CRIT',
    message: string,
    user: string = "SYSTEM",
    canon: 'UNITY' | 'PARSIMONY' | 'RECURSION' = 'UNITY'
) {
    try {
        const db = getAdminDb();
        await db.collection("omni_audit_traces").add({
            action,
            severity,
            message,
            canon,
            timestamp: Date.now(),
            user
        });
    } catch (e) {
        console.error("Failed to log audit trace:", e);
    }
}

export async function verifySovereignCipher(cipher: string) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    // The Cipher is a static architectural secret defined in the environment
    const systemCipher = process.env.SOVEREIGN_CIPHER || "21170194";
    const isValid = cipher === systemCipher;

    if (isValid) {
        await logAuditTrace("CIPHER_AUTH", "INFO", "Sovereign Cipher Authenticated", session?.user?.email || "SYSTEM");
    } else {
        await logAuditTrace("CIPHER_FAILURE", "CRIT", "Invalid Cipher attempt detected", session?.user?.email || "SYSTEM");
    }

    return { success: isValid };
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
        await logAuditTrace("NODE_STATUS_CHANGE", "CRIT", disabled ? "Node banned" : "Node authorized", session?.user?.email || "SYSTEM", "UNITY");
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
        await logAuditTrace("NODE_ESCALATION", "WARN", "Changed node role", session?.user?.email || "SYSTEM", "UNITY");
        return { success: true, message: `Node successfully updated to ${role}.` };
    } catch (e: any) {
        console.error("[Admin Escalation Fault]:", e);
        return { error: true, message: "Escalation failed. Node may not exist." };
    }
}

export async function bulkUpdateNodeRoles(uids: string[], role: "ADMIN" | "USER") {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    try {
        const authAdmin = getAdminAuth();
        const batch = uids.map(uid => authAdmin.setCustomUserClaims(uid, { role }));
        await Promise.all(batch);
        await logAuditTrace("BULK_ESC_OVERWRITE", "WARN", `Modified roles for ${uids.length} nodes to ${role}`, session?.user?.email || "SYSTEM", "UNITY");
        return { success: true };
    } catch (e: any) {
        console.error("[Admin Bulk Esc Fault]:", e);
        return { error: true, message: "Bulk update failed." };
    }
}

export async function bulkUpdateNodeStatus(uids: string[], disabled: boolean) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    try {
        const authAdmin = getAdminAuth();
        const batch = uids.map(uid => authAdmin.updateUser(uid, { disabled }));
        await Promise.all(batch);
        await logAuditTrace("BULK_STATUS_OVERWRITE", "CRIT", `Modified status for ${uids.length} nodes to ${disabled ? 'BANNED' : 'ACTIVE'}`, session?.user?.email || "SYSTEM", "UNITY");
        return { success: true };
    } catch (e: any) {
        console.error("[Admin Bulk Status Fault]:", e);
        return { error: true, message: "Bulk status update failed." };
    }
}

export async function exportSovereignNodesCSV() {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    try {
        const authAdmin = getAdminAuth();
        const listUsersResult = await authAdmin.listUsers(1000);

        const headers = ["UID", "Email", "Name", "Role", "Created", "LastSignIn", "Status"];
        const rows = listUsersResult.users.map(u => [
            u.uid,
            u.email || "",
            u.displayName || "",
            u.customClaims?.role || "USER",
            u.metadata.creationTime,
            u.metadata.lastSignInTime,
            u.disabled ? "BANNED" : "ACTIVE"
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        await logAuditTrace("DATA_SENSITIVE_EXPORT", "CRIT", "Exported full identity matrix to CSV", session?.user?.email || "SYSTEM", "PARSIMONY");
        return { success: true, csv: csvContent };
    } catch (e: any) {
        console.error("[Admin Export Fault]:", e);
        return { error: true, message: "Export failed." };
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
    let resendStatus = process.env.RESEND_API_KEY ? "NOMINAL" : "OFFLINE";
    let stripeStatus = process.env.STRIPE_SECRET_KEY ? "NOMINAL" : "OFFLINE";
    let redisStatus = process.env.UPSTASH_REDIS_REST_URL ? "NOMINAL" : "OFFLINE";
    let posthogStatus = (process.env.NEXT_PUBLIC_POSTHOG_KEY || "") ? "NOMINAL" : "UNSET";

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
        redisEdge: redisStatus,
        posthogPulse: posthogStatus
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
        await logAuditTrace("AESTHETIC_OVERRIDE", "INFO", "Updated WebGL variant", session?.user?.email || "SYSTEM", "RECURSION");
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
        await logAuditTrace("BROADCAST_UPDATE", "INFO", "Updated global broadcast message", session?.user?.email || "SYSTEM", "UNITY");
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
        await logAuditTrace("CONTENT_OVERRIDE", "INFO", "Updated content overrides", session?.user?.email || "SYSTEM", "RECURSION");
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
            resendFrom: data.resendFrom || process.env.RESEND_DEFAULT_FROM || "noreply@yourdomain.com",
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
            gaId: data.gaId !== undefined ? data.gaId : (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ""),
            gaPropertyId: data.gaPropertyId !== undefined ? data.gaPropertyId : (process.env.GA_PROPERTY_ID || ""),
            posthogId: data.posthogId !== undefined ? data.posthogId : "",
            pricingTiers: data.pricingTiers || [{ "id": "basic", "name": "Basic Node", "price": "9", "features": ["Standard Telemetry", "Email Support", "Priority Access"], "buttonText": "Initialize Basic" }, { "id": "pro", "name": "Pro Node", "price": "99", "features": ["Advanced Telemetry", "24/7 Priority Support", "Full Admin Access"], "buttonText": "Initialize Pro" }],
            recommendedPlan: data.recommendedPlan || "pro",
            webglVariant: activeVariant,
            sandboxMode: !!data.sandboxMode,
            mfaEnforced: !!data.mfaEnforced,
            domainShield: !!data.domainShield
        };
    } catch (e: any) {
        return {
            broadcast: "",
            typography: "",
            commerceMode: process.env.COMMERCE_MODE || "saas",
            resendFrom: process.env.RESEND_DEFAULT_FROM || "noreply@yourdomain.com",
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
            gaId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "",
            gaPropertyId: process.env.GA_PROPERTY_ID || "",
            posthogId: "",
            pricingTiers: [{ "id": "basic", "name": "Basic Node", "price": "9", "features": ["Standard Telemetry", "Email Support", "Priority Access"], "buttonText": "Initialize Basic" }, { "id": "pro", "name": "Pro Node", "price": "99", "features": ["Advanced Telemetry", "24/7 Priority Support", "Full Admin Access"], "buttonText": "Initialize Pro" }],
            recommendedPlan: "pro",
            webglVariant: "fire",
            sandboxMode: false,
            mfaEnforced: false
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
        await logAuditTrace("MODE_CHANGE", "WARN", "Toggled sandbox mode", session?.user?.email || "SYSTEM", "PARSIMONY");
        return { success: true };
    } catch (e: any) {
        return { error: true, message: "Sandbox mode toggle failed." };
    }
}

export async function setMFAEnforced(enforced: boolean) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    if (!isRootAdmin) {
        throw new Error("UNAUTHORIZED_ACCESS: Clearance level insufficient.");
    }

    try {
        const db = getAdminDb();
        await db.collection("sovereign_config").doc("global").set({ mfaEnforced: enforced }, { merge: true });
        await logAuditTrace("MFA_ENFORCE_TOGGLE", "WARN", `Toggled workspace MFA enforcement to ${enforced}`, session?.user?.email || "SYSTEM", "UNITY");
        return { success: true };
    } catch (e: any) {
        return { error: true, message: "MFA enforcement toggle failed." };
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
        await logAuditTrace("BRANDING_UPDATE", "INFO", "Updated site title", session?.user?.email || "SYSTEM", "UNITY");
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
        await logAuditTrace("BRANDING_UPDATE", "INFO", "Updated contact email", session?.user?.email || "SYSTEM", "UNITY");
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
        await logAuditTrace("COMMERCE_UPDATE", "INFO", "Changed commerce mode", session?.user?.email || "SYSTEM", "RECURSION");
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
        await logAuditTrace("EMAIL_CONFIG", "WARN", "Updated Resend origin email", session?.user?.email || "SYSTEM", "UNITY");
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
        await updateEdgeConfig({ haltingProtocol: isActive });
        await logAuditTrace("HALT_PROTOCOL", "CRIT", "Toggled global halting protocol", session?.user?.email || "SYSTEM", "UNITY");
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
        await updateEdgeConfig({ preLaunchMode: isActive });
        await logAuditTrace("MODE_CHANGE", "WARN", "Toggled pre-launch mode", session?.user?.email || "SYSTEM", "UNITY");
        return { success: true };
    } catch (e: any) {
        return { error: true, message: "Pre-Launch override failed." };
    }
}

export async function setDomainShield(isActive: boolean) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    if (!isRootAdmin) throw new Error("UNAUTHORIZED_ACCESS: Clearance level insufficient.");

    try {
        await getAdminDb().collection("sovereign_config").doc("global").set({ domainShield: isActive }, { merge: true });
        await updateEdgeConfig({ domainShield: isActive });
        await logAuditTrace("SECURITY_UPDATE", "WARN", `Toggled Domain Shield: ${isActive}`, session?.user?.email || "SYSTEM", "UNITY");
        return { success: true };
    } catch (e: any) {
        return { error: true, message: "Domain Shield override failed." };
    }
}

export async function setPrimaryColor(colorHex: string) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    if (!isRootAdmin) throw new Error("UNAUTHORIZED_ACCESS: Clearance level insufficient.");

    try {
        await getAdminDb().collection("sovereign_config").doc("global").set({ primaryColor: colorHex }, { merge: true });
        await logAuditTrace("BRANDING_UPDATE", "INFO", "Updated primary brand color", session?.user?.email || "SYSTEM", "RECURSION");
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
        await logAuditTrace("BRANDING_UPDATE", "INFO", "Updated social navigation links", session?.user?.email || "SYSTEM", "RECURSION");
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
            canon: d.data().canon || "UNITY",
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
    await logAuditTrace("COMMERCE_UPDATE", "INFO", "Updated pricing tiers matrix", session?.user?.email || "SYSTEM", "RECURSION");
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
    // Normalize route for document ID (Firestore IDs cannot contain / easily without nested paths, so we use _)
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

export async function getStoreProducts(searchStr: string = "", limitCount: number = 50, pageOff: number = 0) {
    const db = getAdminDb();
    try {
        let queryRef: any = db.collection("store_products");
        if (searchStr) {
            queryRef = queryRef.where("name", ">=", searchStr).where("name", "<=", searchStr + '\uf8ff');
        } else {
            queryRef = queryRef.orderBy("name");
        }

        const snap = await queryRef.limit(limitCount).offset(pageOff * limitCount).get();

        let totalCount = 0;
        try {
            const countSnap = await db.collection("store_products").count().get();
            totalCount = countSnap.data().count;
        } catch { }

        return {
            items: snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })),
            totalCount
        };
    } catch (e) {
        return { items: [], totalCount: 0 };
    }
}

export async function bulkImportStoreProducts(products: any[]) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    const db = getAdminDb();
    const batch = db.batch();
    for (const p of products) {
        const docRef = db.collection("store_products").doc();
        batch.set(docRef, { ...p, createdAt: new Date().toISOString() });
    }
    await batch.commit();
    await logAuditTrace("COMMERCE_UPDATE", "WARN", `Bulk imported ${products.length} products`, session?.user?.email || "SYSTEM", "RECURSION");
    return { success: true };
}

export async function bulkUpdateStoreProducts(ids: string[], updates: any) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    const db = getAdminDb();
    const batch = db.batch();

    for (const id of ids) {
        const docRef = db.collection("store_products").doc(id);
        batch.update(docRef, { ...updates, updatedAt: new Date().toISOString() });
    }

    await batch.commit();
    await logAuditTrace("COMMERCE_UPDATE", "WARN", `Bulk updated ${ids.length} products`, session?.user?.email || "SYSTEM", "RECURSION");
    return { success: true };
}

export async function bulkDeleteStoreProducts(ids: string[]) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    const db = getAdminDb();
    const batch = db.batch();

    for (const id of ids) {
        const docRef = db.collection("store_products").doc(id);
        batch.delete(docRef);
    }

    await batch.commit();
    await logAuditTrace("COMMERCE_UPDATE", "CRIT", `Bulk deleted ${ids.length} products`, session?.user?.email || "SYSTEM", "PARSIMONY");
    return { success: true };
}

export async function createStoreProduct(data: any) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");
    const db = getAdminDb();
    const docRef = db.collection("store_products").doc();
    await docRef.set({ ...data, createdAt: new Date().toISOString() });
    await logAuditTrace("COMMERCE_UPDATE", "INFO", "Created new store product", session?.user?.email || "SYSTEM", "RECURSION");
    return { success: true, id: docRef.id };
}

export async function updateStoreProduct(id: string, data: any) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");
    const db = getAdminDb();
    await db.collection("store_products").doc(id).set(data, { merge: true });
    await logAuditTrace("COMMERCE_UPDATE", "INFO", "Updated store product", session?.user?.email || "SYSTEM", "RECURSION");
    return { success: true };
}

export async function deleteStoreProduct(id: string) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");
    const db = getAdminDb();
    await db.collection("store_products").doc(id).delete();
    await logAuditTrace("COMMERCE_UPDATE", "WARN", "Deleted store product", session?.user?.email || "SYSTEM", "PARSIMONY");
    return { success: true };
}
