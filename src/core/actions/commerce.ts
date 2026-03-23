"use server";

import { getAdminDb, getCollectionName } from "@/core/firebase/admin";
import { auth } from "@/core/auth";
import { getGlobalOverrides } from "./branding";
import { logAuditTrace } from "./nodes";

/**
 * Double-Guard Security Pattern:
 * Verifies that the 'commerce' module is enabled via global governance flags
 * before allowing any store-related mutations.
 */
async function verifyCommerceClearance() {
    const overrides = await getGlobalOverrides();
    if (!overrides.modules.store) {
        throw new Error("COMMERCE_LOCKED: The commerce matrix is currently offline.");
    }
}

export async function setCommerceMode(mode: string) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    try {
        const db = getAdminDb();
        await db.collection(getCollectionName("sovereign_config")).doc("global").set({ commerceMode: mode }, { merge: true });
        await logAuditTrace("COMMERCE_UPDATE", "INFO", `Changed commerce mode to ${mode}`, session?.user?.email || "SYSTEM", "RECURSION");
        return { success: true };
    } catch (e: any) {
        return { error: true };
    }
}

export async function setPricingMatrix(data: {
    pricingTiers: any[],
    recommendedPlan: string
}) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    await verifyCommerceClearance();

    const db = getAdminDb();
    await db.collection(getCollectionName("sovereign_config")).doc("global").set({
        pricingTiers: data.pricingTiers || [],
        recommendedPlan: data.recommendedPlan || ""
    }, { merge: true });
    await logAuditTrace("COMMERCE_UPDATE", "INFO", "Updated pricing tiers matrix", session?.user?.email || "SYSTEM", "RECURSION");
    return { success: true };
}

export async function getStoreProducts(searchStr: string = "", limitCount: number = 50, pageOff: number = 0) {
    // Read-only operations are permitted even if module is off for administrative visibility
    const db = getAdminDb();
    try {
        let queryRef: any = db.collection(getCollectionName("store_products"));
        if (searchStr) {
            queryRef = queryRef.where("name", ">=", searchStr).where("name", "<=", searchStr + '\uf8ff');
        } else {
            queryRef = queryRef.orderBy("name");
        }

        const snap = await queryRef.limit(limitCount).offset(pageOff * limitCount).get();

        let totalCount = 0;
        try {
            const countSnap = await db.collection(getCollectionName("store_products")).count().get();
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

    await verifyCommerceClearance();

    const db = getAdminDb();
    const batch = db.batch();
    for (const p of products) {
        const docRef = db.collection(getCollectionName("store_products")).doc();
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

    await verifyCommerceClearance();

    const db = getAdminDb();
    const batch = db.batch();
    for (const id of ids) {
        const docRef = db.collection(getCollectionName("store_products")).doc(id);
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

    await verifyCommerceClearance();

    const db = getAdminDb();
    const batch = db.batch();
    for (const id of ids) {
        const docRef = db.collection(getCollectionName("store_products")).doc(id);
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

    await verifyCommerceClearance();

    const db = getAdminDb();
    const docRef = db.collection(getCollectionName("store_products")).doc();
    await docRef.set({ ...data, createdAt: new Date().toISOString() });
    await logAuditTrace("COMMERCE_UPDATE", "INFO", "Created new store product", session?.user?.email || "SYSTEM", "RECURSION");
    return { success: true, id: docRef.id };
}

export async function updateStoreProduct(id: string, data: any) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    await verifyCommerceClearance();

    const db = getAdminDb();
    await db.collection(getCollectionName("store_products")).doc(id).set(data, { merge: true });
    await logAuditTrace("COMMERCE_UPDATE", "INFO", "Updated store product", session?.user?.email || "SYSTEM", "RECURSION");
    return { success: true };
}

export async function deleteStoreProduct(id: string) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    await verifyCommerceClearance();

    const db = getAdminDb();
    await db.collection(getCollectionName("store_products")).doc(id).delete();
    await logAuditTrace("COMMERCE_UPDATE", "WARN", "Deleted store product", session?.user?.email || "SYSTEM", "PARSIMONY");
    return { success: true };
}
