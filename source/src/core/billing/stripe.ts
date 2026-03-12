import Stripe from "stripe";

const getStripeKey = () => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
        throw new Error("Missing STRIPE_SECRET_KEY environment variable. Cannot initialize Billing Matrix.");
    }
    return key;
};

// Global singleton to prevent opening duplicate connections across Vercel serverless functions
const globalForStripe = global as unknown as { stripe: Stripe };

export const stripe =
    globalForStripe.stripe ||
    new Stripe(getStripeKey(), {
        apiVersion: "2026-02-25.clover", // Up-to-date Stripe SDK Versioning
        appInfo: {
            name: "Sovereign Substrate Base",
            version: "1.0.0",
        },
    });

if (process.env.NODE_ENV !== "production") globalForStripe.stripe = stripe;
