"use server";

import { stripe } from "./stripe";
import { headers } from "next/headers";
import { auth } from "@/core/auth";
import { getGlobalOverrides } from "@/core/actions/system";

export async function createCheckoutSession(priceId: string) {
    const session = await auth();

    if (!session?.user) {
        throw new Error("Unauthorized Network Block. Authentication required to interact with Billing Matrix.");
    }

    const overrides = await getGlobalOverrides();
    const COMMERCE_MODE = overrides.commerceMode;
    if (COMMERCE_MODE === "none") {
        throw new Error("Billing Matrix Offline: Commerce features are natively disabled in this substrate.");
    }

    const headersList = await headers();
    const origin = headersList.get("origin") || process.env.AUTH_URL || "http://localhost:3000";

    try {
        const stripeSession = await stripe.checkout.sessions.create({
            mode: COMMERCE_MODE === "saas" ? "subscription" : "payment",
            customer_email: session.user.email as string,
            client_reference_id: session.user.id,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${origin}/dashboard?checkout_success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/dashboard?checkout_canceled=true`,
        });

        return { url: stripeSession.url };
    } catch (e: any) {
        console.error("[Billing Trace - Checkout Session Fault]:", e);
        throw new Error("Unable to initialize Secure Payment Gateway.");
    }
}
