"use server";

import { getAdminDb } from "@/core/firebase/admin";
import { auth } from "@/core/auth";
import { logAuditTrace } from "./admin";

export async function createVoucher(planId: string, durationMonths: number, limit: number = 1) {
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

    for (let i = 0; i < limit; i++) {
        // Generate a cryptographically secure random 12-character code (e.g., PREFIX-XXXX-XXXX)
        const rawCode = Array.from({ length: 8 }, () => Math.random().toString(36).charAt(2).toUpperCase()).join('');
        const formattedCode = `${prefix}-${rawCode.slice(0, 4)}-${rawCode.slice(4, 8)}`;

        await db.collection("vouchers").doc(formattedCode).set({
            planId,
            durationMonths,
            status: "ACTIVE",
            createdAt: Date.now(),
            createdBy: session?.user?.email || "SYSTEM",
        });

        newCodes.push(formattedCode);
    }

    await logAuditTrace("VOUCHER_MINTED", "INFO", `Minted ${limit} voucher(s) for plan ${planId}`, session?.user?.email || "SYSTEM");
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

export async function revokeVoucher(code: string) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.email !== process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) {
        throw new Error("UNAUTHORIZED");
    }

    const safeEmail = session?.user?.email || "SYSTEM";
    const db = getAdminDb();
    await db.collection("vouchers").doc(code).update({
        status: "REVOKED"
    });

    await logAuditTrace("VOUCHER_REVOKED", "WARN", `Revoked voucher ${code}`, safeEmail);
    return { success: true };
}

export async function redeemVoucher(workspaceId: string, code: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("UNAUTHORIZED");

    const db = getAdminDb();
    const callerMemberSnap = await db.collection("omni_workspaces").doc(workspaceId).collection("members").doc(session.user.id).get();

    if (!callerMemberSnap.exists || (callerMemberSnap.data()?.role !== "OWNER" && callerMemberSnap.data()?.role !== "ADMIN")) {
        throw new Error("Insufficient workspace privileges to apply structural billing changes.");
    }

    const voucherSnap = await db.collection("vouchers").doc(code).get();
    if (!voucherSnap.exists) throw new Error("Invalid or corrupted voucher code.");

    const voucherData = voucherSnap.data();
    if (voucherData?.status !== "ACTIVE") throw new Error("This voucher has already been redeemed or revoked.");

    // Calculate expiration natively unless lifetime (-1)
    let periodEnd = null;
    if (voucherData.durationMonths !== -1) {
        const currentDate = new Date();
        currentDate.setMonth(currentDate.getMonth() + voucherData.durationMonths);
        periodEnd = currentDate.getTime();
    }

    // Apply the structural upgrade matrix
    await db.runTransaction(async (t) => {
        const workspaceRef = db.collection("omni_workspaces").doc(workspaceId);
        const voucherRef = db.collection("vouchers").doc(code);

        t.update(workspaceRef, {
            subscriptionStatus: "active",
            planId: voucherData.planId,
            stripeSubscriptionId: `voucher_${code}`,
            currentPeriodEnd: periodEnd, // null means lifetime
            updatedAt: Date.now()
        });

        t.update(voucherRef, {
            status: "REDEEMED",
            redeemedAt: Date.now(),
            redeemedBy: session.user!.id,
            redeemingWorkspace: workspaceId
        });
    });

    await db.collection("omni_workspaces").doc(workspaceId).collection("audit_logs").add({
        action: "VOUCHER_REDEEMED",
        actor: session.user.email,
        details: `Redeemed hardware license / voucher ${code} for plan ${voucherData.planId}`,
        timestamp: Date.now()
    });

    return { success: true };
}
