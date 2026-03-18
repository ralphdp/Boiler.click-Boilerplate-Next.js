import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAdminDb } from '@/core/firebase/admin';
import { getGlobalOverrides } from '@/core/actions/system';
import { z } from 'zod';

const StripeSignatureSchema = z.string().min(5, "Invalid or missing Stripe Signature");
const SessionMetadataSchema = z.object({
    client_reference_id: z.string().min(1, "Workspace ID is required for mapping"),
    customer: z.string().min(1, "Customer ID is required"),
    subscription: z.string().min(1, "Subscription ID is required")
}).passthrough();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-12-18.acacia" as any
});

export async function POST(req: Request) {
    const rawBody = await req.text();
    const rawSignature = req.headers.get('stripe-signature');
    const signatureParse = StripeSignatureSchema.safeParse(rawSignature);

    if (!signatureParse.success) {
        return new NextResponse("Unsigned Webhook (Zod Validation Failed)", { status: 400 });
    }

    const signature = signatureParse.data;

    const overrides = await getGlobalOverrides();
    if (overrides.haltingProtocol) {
        console.warn("[Stripe Webhook] System Halted. Rejecting webhook for later retry.");
        return new NextResponse("Substrate Halted", { status: 503 });
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

                // Enforce strict Zod payload integrity
                const metaParse = SessionMetadataSchema.safeParse(session);
                if (!metaParse.success) {
                    console.error(`[Stripe Webhook Error] Malformed Session Metadata:`, metaParse.error);
                    return new NextResponse("Invalid Session Zod Structure", { status: 400 });
                }

                const workspaceId = metaParse.data.client_reference_id;

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
