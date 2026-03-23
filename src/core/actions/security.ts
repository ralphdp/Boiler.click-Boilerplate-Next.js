"use server";
import { getAdminDb, getCollectionName } from "@/core/firebase/admin";
import { auth } from "@/core/auth";
import { logAuditTrace } from "./nodes";

export async function setMFAEnforced(enforced: boolean) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    try {
        const db = getAdminDb();
        await db.collection(getCollectionName("sovereign_config")).doc("global").set({ mfaEnforced: enforced }, { merge: true });
        await logAuditTrace("MFA_ENFORCE_TOGGLE", "WARN", `Toggled workspace MFA enforcement to ${enforced}`, session?.user?.email || "SYSTEM", "UNITY");
        return { success: true };
    } catch (e: any) {
        return { error: true };
    }
}

export async function setRateLimitMode(mode: string) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    const db = getAdminDb();
    await db.collection(getCollectionName("sovereign_config")).doc("global").set({ rateLimitMode: mode }, { merge: true });
    await logAuditTrace("SECURITY_UPDATE", "CRIT", "Adjusted rate limit strictness", session?.user?.email || "SYSTEM", "PARSIMONY");
    return { success: true };
}

export async function setDomainShield(enabled: boolean) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    try {
        await getAdminDb().collection(getCollectionName("sovereign_config")).doc("global").set({ domainShield: enabled }, { merge: true });
        await logAuditTrace("SECURITY_UPDATE", "WARN", `Toggled domain shield to ${enabled}`, session?.user?.email || "SYSTEM", "PARSIMONY");
        return { success: true };
    } catch (e: any) {
        return { error: true };
    }
}
