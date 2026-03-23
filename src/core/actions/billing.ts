"use server";

import { getAdminDb, getCollectionName } from "@/core/firebase/admin";
import { auth } from "@/core/auth";
import Stripe from "stripe";
import { logWorkspaceAction } from "./workspaces";
import { logAuditTrace } from "./audit";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2024-12-18.acacia" as any
});

export async function createCheckoutSession(workspaceId: string, priceId: string, locale: string = "en") {
    const session = await auth();
    if (!session?.user?.id) throw new Error("UNAUTHORIZED");

    const db = getAdminDb();
    const callerMemberSnap = await db.collection(getCollectionName("omni_workspaces")).doc(workspaceId).collection("members").doc(session.user.id).get();

    if (!callerMemberSnap.exists || !["OWNER", "ADMIN"].includes(callerMemberSnap.data()?.role)) {
        throw new Error("UNAUTHORIZED_ACCESS: Only ADMINs can modify billing matrices.");
    }

    try {
        const workspaceSnap = await db.collection(getCollectionName("omni_workspaces")).doc(workspaceId).get();
        const workspaceData = workspaceSnap.data();
        let customerId = workspaceData?.stripeCustomerId;

        // Create a Stripe Customer if one does not exist for this Workspace
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: session.user.email || undefined,
                name: workspaceData?.name || "Omni Workspace",
                metadata: {
                    workspaceId: workspaceId
                }
            });
            customerId = customer.id;
            await db.collection(getCollectionName("omni_workspaces")).doc(workspaceId).update({ stripeCustomerId: customerId });
        }

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

        const checkoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            client_reference_id: workspaceId,
            success_url: `${siteUrl}/${locale}/dashboard/billing?status=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${siteUrl}/${locale}/dashboard/billing?status=cancelled`,
        });

        await logWorkspaceAction(workspaceId, "BILLING_CHECKOUT_INITIATED", `Checkout pulse mapped to ${priceId}`);
        await logAuditTrace("BILLING_HANDSHAKE", "INFO", `Workspace ${workspaceId} initiated Stripe session for ${priceId}`, session.user.email || "SYSTEM", "RECURSION");

        return { url: checkoutSession.url };
    } catch (e: any) {
        console.error("Stripe Session Matrix Fault:", e);
        throw new Error(e.message || "Failed to initialize cryptographic billing handshake.");
    }
}

export async function createBillingPortal(workspaceId: string, locale: string = "en") {
    const session = await auth();
    if (!session?.user?.id) throw new Error("UNAUTHORIZED");

    const db = getAdminDb();
    const callerMemberSnap = await db.collection(getCollectionName("omni_workspaces")).doc(workspaceId).collection("members").doc(session.user.id).get();

    if (!callerMemberSnap.exists || !["OWNER", "ADMIN"].includes(callerMemberSnap.data()?.role)) {
        throw new Error("UNAUTHORIZED_ACCESS: Only ADMINs can access the billing portal.");
    }

    const workspaceSnap = await db.collection(getCollectionName("omni_workspaces")).doc(workspaceId).get();
    const customerId = workspaceSnap.data()?.stripeCustomerId;

    if (!customerId) {
        throw new Error("NO_CUSTOMER: Substrate is not currently bound to a billing matrix.");
    }

    try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${siteUrl}/${locale}/dashboard/billing`,
        });

        return { url: portalSession.url };
    } catch (e: any) {
        console.error("Stripe Portal Matrix Fault:", e);
        throw new Error(e.message || "Failed to initialize Stripe Hub.");
    }
}

export async function getWorkspaceBilling(workspaceId: string) {
    const session = await auth();
    if (!session?.user?.id) return null;

    const db = getAdminDb();
    const snap = await db.collection(getCollectionName("omni_workspaces")).doc(workspaceId).get();

    if (!snap.exists) return null;

    // Safety check just in case, though the active context implies they should be able to see this
    return {
        billingStatus: snap.data()?.billingStatus || "none",
        subscriptionId: snap.data()?.subscriptionId || null,
        customerId: snap.data()?.stripeCustomerId || null
    };
}
