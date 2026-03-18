"use server";

import { getAdminDb } from "@/core/firebase/admin";
import { auth } from "@/core/auth";
import { logAuditTrace } from "./admin";

export type VoucherType = 'PLAN_UNLOCK' | 'PERCENTAGE' | 'CREDIT';

export async function createVoucher(
    planId: string,
    durationMonths: number,
    limit: number = 1,
    type: VoucherType = 'PLAN_UNLOCK',
    value: number = 0,
    maxRedemptions: number = 1,
    expiryDate?: number
) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.email !== process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) {
        throw new Error("UNAUTHORIZED");
    }

    const newCodes = [];
    const db = getAdminDb();

    let prefix = "VGRD";
    const overridesSnap = await db.collection("sovereign_config").doc("global").get();
    if (overridesSnap.exists) {
        const title = overridesSnap.data()?.siteTitle;
        if (title) {
            const cleanTitle = title.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
            if (cleanTitle.length > 0) {
                prefix = cleanTitle.slice(0, 4).padEnd(4, 'X');
            }
        }
    }

    const batch = db.batch();

    for (let i = 0; i < limit; i++) {
        const rawCode = Array.from({ length: 8 }, () => Math.random().toString(36).charAt(2).toUpperCase()).join('');
        const formattedCode = `${prefix}-${rawCode.slice(0, 4)}-${rawCode.slice(4, 8)}`;

        const docRef = db.collection("vouchers").doc(formattedCode);
        batch.set(docRef, {
            type,
            value,
            planId,
            durationMonths,
            maxRedemptions,
            redemptionCount: 0,
            expiryDate: expiryDate || null,
            status: "ACTIVE",
            createdAt: Date.now(),
            createdBy: session?.user?.email || "SYSTEM",
        });

        newCodes.push(formattedCode);
    }

    await batch.commit();
    await logAuditTrace("VOUCHER_MINTED", "INFO", `Minted ${limit} voucher(s) of type ${type}`, session?.user?.email || "SYSTEM");
    return { success: true, codes: newCodes };
}

export async function getVouchers() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.email !== process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) {
        throw new Error("UNAUTHORIZED");
    }

    const db = getAdminDb();
    const snap = await db.collection("vouchers").orderBy("createdAt", "desc").get();

    return snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}

export async function exportVouchersCSV() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.email !== process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) {
        throw new Error("UNAUTHORIZED");
    }

    const db = getAdminDb();
    const snap = await db.collection("vouchers").orderBy("createdAt", "desc").get();

    const header = ["Code", "Type", "Value", "Plan", "Duration", "Redemptions", "Max", "Status", "Expiry", "Created"];
    const rows = snap.docs.map(doc => {
        const data = doc.data();
        return [
            doc.id,
            data.type,
            data.value,
            data.planId,
            data.durationMonths,
            data.redemptionCount,
            data.maxRedemptions,
            data.status,
            data.expiryDate ? new Date(data.expiryDate).toISOString() : "NEVER",
            new Date(data.createdAt).toISOString()
        ];
    });

    const csvContent = [header, ...rows].map(e => e.map(item => `"${String(item).replace(/"/g, '""')}"`).join(",")).join("\n");
    return { success: true, csv: csvContent };
}

export async function revokeVoucher(code: string) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.email !== process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) {
        throw new Error("UNAUTHORIZED");
    }

    const db = getAdminDb();
    await db.collection("vouchers").doc(code).update({
        status: "REVOKED"
    });

    await logAuditTrace("VOUCHER_REVOKED", "WARN", `Revoked voucher ${code}`, session?.user?.email || "SYSTEM");
    return { success: true };
}

export async function redeemVoucher(workspaceId: string, code: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("UNAUTHORIZED");

    const db = getAdminDb();
    const voucherRef = db.collection("vouchers").doc(code);

    const res = await db.runTransaction(async (t) => {
        const voucherSnap = await t.get(voucherRef);
        if (!voucherSnap.exists) throw new Error("Invalid voucher code.");

        const data = voucherSnap.data()!;
        if (data.status !== "ACTIVE") throw new Error("Voucher is not active.");
        if (data.expiryDate && data.expiryDate < Date.now()) {
            t.update(voucherRef, { status: "EXPIRED" });
            throw new Error("Voucher has expired.");
        }
        if (data.maxRedemptions !== -1 && data.redemptionCount >= data.maxRedemptions) {
            t.update(voucherRef, { status: "MAXED" });
            throw new Error("Voucher redemption limit reached.");
        }

        const workspaceRef = db.collection("omni_workspaces").doc(workspaceId);
        const workspaceSnap = await t.get(workspaceRef);
        if (!workspaceSnap.exists) throw new Error("Workspace not found.");

        const workspaceData = workspaceSnap.data()!;
        // Prevent duplicate plan unlocks for the same workspace
        if (data.type === 'PLAN_UNLOCK' && workspaceData.planId === data.planId && workspaceData.subscriptionStatus === 'active') {
            throw new Error("Workspace already operates on this hardware protocol.");
        }

        // Apply logic
        let updates: any = { updatedAt: Date.now() };
        if (data.type === 'PLAN_UNLOCK') {
            let periodEnd = null;
            if (data.durationMonths !== -1) {
                const currentDate = new Date();
                currentDate.setMonth(currentDate.getMonth() + data.durationMonths);
                periodEnd = currentDate.getTime();
            }
            updates.planId = data.planId;
            updates.subscriptionStatus = "active";
            updates.stripeSubscriptionId = `voucher_${code}`;
            updates.currentPeriodEnd = periodEnd;
        }

        t.update(workspaceRef, updates);

        const newCount = (data.redemptionCount || 0) + 1;
        t.update(voucherRef, {
            redemptionCount: newCount,
            status: (data.maxRedemptions !== -1 && newCount >= data.maxRedemptions) ? "MAXED" : "ACTIVE"
        });

        // Record usage
        const usageRef = voucherRef.collection("redemptions").doc();
        t.set(usageRef, {
            workspaceId,
            userId: session.user!.id,
            timestamp: Date.now()
        });

        return { success: true };
    });

    await db.collection("omni_workspaces").doc(workspaceId).collection("audit_logs").add({
        action: "VOUCHER_REDEEMED",
        actor: session.user.email,
        details: `Voucher ${code} applied to Substrate matrix.`,
        timestamp: Date.now()
    });

    return res;
}
