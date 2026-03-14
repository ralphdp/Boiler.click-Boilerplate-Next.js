import { Redis } from "@upstash/redis";

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
}

/**
 * Executes a fast, edge-compatible retrieval of active system Feature Flags.
 * @param uid The target User ID to evaluate split testing overrides.
 */
export async function getEdgeFeatureFlags(uid: string | null = null): Promise<Record<string, boolean>> {
    // Failsafe baseline capabilities if Redis is disconnected
    const baselineFlags = { "onboardingV2": true, "betaDashboard": false };

    if (process.env.REDIS_PROVIDER !== "upstash" || !redis) return baselineFlags;

    try {
        const key = `flags:global`;
        const globalFlags = await redis.hgetall(key) as Record<string, string> || {};

        let userOverrides: Record<string, string> = {};
        if (uid) {
            userOverrides = await redis.hgetall(`flags:user:${uid}`) as Record<string, string> || {};
        }

        // Merge baseline -> global configurations -> user-specific overrides
        const finalFlags: Record<string, boolean> = { ...baselineFlags };

        Object.entries(globalFlags).forEach(([k, v]) => finalFlags[k] = v === "true");
        Object.entries(userOverrides).forEach(([k, v]) => finalFlags[k] = v === "true");

        return finalFlags;
    } catch (e) {
        console.error("[SECURITY TRACE] Upstash Feature Flags Fault:", e);
        return baselineFlags;
    }
}
