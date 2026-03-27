/**
 * FACTORY SETTINGS & DEFAULTS LAYER
 * This file serves as the ultimate fallback for all UI and commercial logic 
 * when Firebase is unreachable or the 'global' document is uninitialized.
 */

export const FACTORY_DEFAULTS = {
    // Branding & Core Identity
    siteTitle: "Sovereign Substrate",
    tagline: "High-Fidelity Boilerplate Architecture (v6.8.5)",
    siteDescription: "The definitive Next.js boilerplate for sovereign SaaS and localized commerce nodes.",
    primaryColor: "#a855f7", // Purpureal Vanguard

    // Growth & Visibility
    preLaunchMode: false,
    haltingProtocol: false, // Emergency system halt
    contactEmail: "nexus@boilerplate.com",
    resendFrom: "Boilerplate <noreply@boiler.click>",

    // Social Vector Shards
    socialX: "https://x.com/ralpdp",
    socialGithub: "https://github.com/organization/boilerplate-repo",
    socialDiscord: "",

    // Global Commerce Logic (SaaS Matrix)
    commerceMode: "saas", // saas | marketplace
    recommendedPlan: "pro",
    pricingTiers: [
        {
            id: "starter",
            title: "Starter",
            price: 0,
            interval: "month",
            features: ["1 Workspace", "Basic Telemetry", "Identity Node"],
            desc: "Ideal for local dev nodes."
        },
        {
            id: "pro",
            title: "Pro",
            price: 49,
            interval: "month",
            features: ["Unlimited Workspaces", "Full Security Matrix", "24/7 Shard Support"],
            desc: "The standard for production SaaS.",
            recommended: true
        },
        {
            id: "enterprise",
            title: "Enterprise",
            price: 99,
            interval: "month",
            features: ["Dedicated Edge Cluster", "HS256 Cold Storage", "SLA Handshake"],
            desc: "Institutional sovereignty."
        }
    ],

    // Strategy & Governance
    modules: {
        vfs: true,
        vouchers: true,
        store: true,
        workspaces: true,
        api: true,
        socialAuth: true,
        publicAnalytics: false,
        auditVisibility: true,
        aiSupport: true
    }
};
