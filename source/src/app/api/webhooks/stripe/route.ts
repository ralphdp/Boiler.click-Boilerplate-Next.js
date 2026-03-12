import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/core/billing/stripe";
import type Stripe from "stripe";

const getWebhookSecret = () => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
        throw new Error("Missing STRIPE_WEBHOOK_SECRET context.");
    }
    return secret;
};

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
        return new NextResponse("Unauthorized Network Block - Webhook Identity Missing", { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, getWebhookSecret());
    } catch (error: any) {
        console.error("[Billing Trace - Signature Verification Failed]", error.message);
        return new NextResponse(`Stripe Proxy Rejected: ${error.message}`, { status: 400 });
    }

    const COMMERCE_MODE = process.env.COMMERCE_MODE || "saas";
    if (COMMERCE_MODE === "none") {
        console.warn("[Billing Trace] Webhook intercepted while Commerce Mode is 'none'.");
        return new NextResponse("Commerce Module Disabled.", { status: 400 });
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                if (COMMERCE_MODE === "saas") {
                    // Inject database logic to activate user SaaS subscription securely...
                    console.log(`[Billing Engine SaaS] Subscription Initiated for User: ${session.client_reference_id}`);
                } else if (COMMERCE_MODE === "store") {
                    // Parse line_items and trigger E-commerce Fulfillment Pipeline securely...
                    console.log(`[Billing Engine E-Commerce] Store Order Verified for Checkout ID: ${session.id}`);
                }
                break;
            }
            case "customer.subscription.updated":
            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                console.log(`[Billing Engine Event] Subscription Mutated: ${subscription.id} -> Status: ${subscription.status}`);
                // Safely toggle Database flags here directly via the OmniAdapter or native Firebase queries...
                break;
            }
            default:
                console.log(`[Billing Engine Event] Unhandled Webhook Stripe Node Event -> Type: ${event.type}`);
        }
    } catch (e: any) {
        console.error("[Fatal E-Commerce Thread Error]", e);
        return new NextResponse("System Database Error Encountered During Webhook Processing.", { status: 500 });
    }

    return new NextResponse(null, { status: 200 });
}
