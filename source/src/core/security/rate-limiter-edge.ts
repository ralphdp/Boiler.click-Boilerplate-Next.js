import { Redis } from "@upstash/redis";

// Vanguard Intercept: Edge-Compatible token bucket via Upstash REST payload.
let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
}

/**
 * Executes a fast, edge-compatible token bucket algorithm to rate-limit raw requests.
 * @param identifier The unique IP or string to evaluate memory.
 * @param limit Total tokens allowed in a given window.
 * @param windowSeconds Duration of the memory lock in seconds.
 */
export async function checkEdgeRateLimit(identifier: string, limit = 10, windowSeconds = 60) {
    if (process.env.REDIS_PROVIDER !== "upstash" || !redis) return true;

    try {
        const key = `ratelimit:edge:${identifier}`;
        const reqCount = await redis.incr(key);
        if (reqCount === 1) {
            await redis.expire(key, windowSeconds);
        }
        return reqCount <= limit;
    } catch (e) {
        console.error("[SECURITY TRACE] Upstash Edge Limit Fault:", e);
        return true; // Failsafe Open to prevent locking out authentic traffic.
    }
}
