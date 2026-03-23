"use server";

import { getAdminDb, getCollectionName } from "@/core/firebase/admin";
import { auth } from "@/core/auth";
import crypto from "crypto";
import { logAuditTrace } from "./nodes";

export async function generateAPIKey(name: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("UNAUTHORIZED_ACCESS: Authentication required.");

    const db = getAdminDb();

    // Generate a secure Vanguard Key prefixed with `sk_van_`
    const rawKey = crypto.randomBytes(32).toString('hex');
    const apiKey = `sk_van_${rawKey}`;

    // Hash the key for secure storage so we don't hold raw API keys
    const hash = crypto.createHash('sha256').update(apiKey).digest('hex');

    const keyDoc = db.collection(getCollectionName("omni_api_keys")).doc();

    await keyDoc.set({
        name,
        keyHash: hash,
        userId: session.user.id,
        createdAt: Date.now(),
        lastUsedAt: null,
        preview: `sk_van_...${rawKey.slice(-4)}`,
        status: "ACTIVE" // "ACTIVE" | "REVOKED"
    });

    await logAuditTrace("API_KEY_GENERATED", "INFO", `Generated programmatic access key: ${name}`, session.user.email || "SYSTEM");

    return { success: true, apiKey, preview: `sk_van_...${rawKey.slice(-4)}` };
}

export async function getUserAPIKeys() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const db = getAdminDb();
    const snap = await db.collection(getCollectionName("omni_api_keys"))
        .where("userId", "==", session.user.id)
        .where("status", "==", "ACTIVE")
        .get();

    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function revokeAPIKey(keyId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("UNAUTHORIZED");

    const db = getAdminDb();
    const keySnap = await db.collection(getCollectionName("omni_api_keys")).doc(keyId).get();

    if (!keySnap.exists || keySnap.data()?.userId !== session.user.id) {
        throw new Error("UNAUTHORIZED_ACCESS: Key does not exist or does not belong to you.");
    }

    await db.collection(getCollectionName("omni_api_keys")).doc(keyId).set({ status: "REVOKED" }, { merge: true });

    await logAuditTrace("API_KEY_REVOKED", "WARN", `Revoked API Key: ${keySnap.data()?.name}`, session.user.email || "SYSTEM");

    return { success: true };
}
