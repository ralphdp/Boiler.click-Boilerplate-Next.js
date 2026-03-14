import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAdminDb } from '@/core/firebase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-12-18.acacia" as any
});

export async function POST(req: Request) {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
        return new NextResponse("Unsigned Webhook", { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error(`[Stripe Webhook Error]: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const workspaceId = session.client_reference_id;

                if (workspaceId) {
                    const db = getAdminDb();
                    await db.collection("omni_workspaces").doc(workspaceId).set({
                        stripeCustomerId: session.customer as string,
                        subscriptionId: session.subscription as string,
                        billingStatus: "active"
                    }, { merge: true });

                    await db.collection("omni_workspaces").doc(workspaceId).collection("audit_logs").add({
                        action: "BILLING_COMPLETED",
                        details: `Stripe Handshake Verified. Cipher Linked.`,
                        user: "SYSTEM",
                        timestamp: Date.now()
                    });
                }
                console.log(`[Stripe] Checkout Completed mapping to Workspace ID: ${workspaceId}`);
                break;
            }
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const db = getAdminDb();
                const snapshot = await db.collection("omni_workspaces").where("subscriptionId", "==", subscription.id).get();
                if (!snapshot.empty) {
                    const workspaceId = snapshot.docs[0].id;
                    await db.collection("omni_workspaces").doc(workspaceId).set({
                        billingStatus: "canceled"
                    }, { merge: true });
                    await db.collection("omni_workspaces").doc(workspaceId).collection("audit_logs").add({
                        action: "BILLING_CANCELED",
                        details: `Subscription Severed. Access Halting.`,
                        user: "SYSTEM",
                        timestamp: Date.now()
                    });
                }
                console.log(`[Stripe] Subscription Cancelled: ${subscription.id}`);
                break;
            }
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const db = getAdminDb();
                const snapshot = await db.collection("omni_workspaces").where("subscriptionId", "==", subscription.id).get();
                if (!snapshot.empty) {
                    const workspaceId = snapshot.docs[0].id;
                    const status = subscription.status; // active, past_due, unpaid, canceled, incomplete

                    await db.collection("omni_workspaces").doc(workspaceId).set({
                        billingStatus: status
                    }, { merge: true });
                }
                console.log(`[Stripe] Subscription Updated: ${subscription.id}`);
                break;
            }
            default:
                console.log(`[Stripe] Unhandled Event: ${event.type}`);
        }

        return new NextResponse(null, { status: 200 });
    } catch (err: any) {
        console.error('[Stripe] Substrate processing error', err);
        return new NextResponse("Internal Substrate Error", { status: 500 });
    }
}
