"use server";
import { getAdminAuth, getAdminDb, getCollectionName } from "@/core/firebase/admin";
import { auth } from "@/core/auth";
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

export async function setTelemetryKeys(keys: { posthogKey?: string, posthogHost?: string, gaId?: string, gaPropertyId?: string, posthogId?: string }) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    try {
        await getAdminDb().collection(getCollectionName("sovereign_config")).doc("global").set(keys, { merge: true });
        await logAuditTrace("CONFIG_UPDATE", "INFO", "Updated telemetry/analytics keys", session?.user?.email || "SYSTEM", "UNITY");
        return { success: true };
    } catch (e: any) {
        return { error: true };
    }
}
