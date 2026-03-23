"use server";

import { getAdminDb, getCollectionName } from "@/core/firebase/admin";
import { auth } from "@/core/auth";

export async function checkSessionValidity() {
    const session = await auth();
    if (!session?.user?.id) return { valid: false, forceRefresh: false };

    try {
        const db = getAdminDb();
        const userSnap = await db.collection(getCollectionName("users")).doc(session.user.id).get();
        if (!userSnap.exists) return { valid: true, forceRefresh: false }; // Normal case if users document isn't fully established yet

        const data = userSnap.data();
        const tokensValidAfterTime = data?.tokensValidAfterTime;
        const isSuperAdmin = session.user.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
        const dbRole = isSuperAdmin ? 'ADMIN' : (data?.role || 'USER');

        // If the database has a revocation timestamp, send it down so the client JWT can be checked
        return {
            valid: true,
            tokensValidAfterTime: tokensValidAfterTime || null,
            dbRole
        };
    } catch (e) {
        console.error("Session Validation Fault:", e);
        return { valid: true }; // Fail open for Edge errors so we don't accidentally boot legit users
    }
}
