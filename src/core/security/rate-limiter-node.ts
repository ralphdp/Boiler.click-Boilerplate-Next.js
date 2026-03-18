import Redis from "ioredis";

// Vanguard Intercept: Server-Compatible TCP array for standard Redis clusters.
// ONLY to be invoked inside Next.js API Routes or Server Actions (not proxy.ts or Edge runtimes).

let redis: Redis | null = null;
if (process.env.REDIS_TCP_URL) {
    redis = new Redis(process.env.REDIS_TCP_URL);
}

/**
 * Executes a fast Node.js TCP token bucket algorithm to rate-limit raw requests on the server backend.
 * @param identifier The unique IP or string to evaluate memory.
 * @param limit Total tokens allowed in a given window.
 * @param windowSeconds Duration of the memory lock in seconds.
 */
export async function checkNodeRateLimit(identifier: string, limit = 10, windowSeconds = 60) {
    if (process.env.REDIS_PROVIDER !== "node" || !redis) return true;

    try {
        const key = `ratelimit:node:${identifier}`;
        const reqCount = await redis.incr(key);
        if (reqCount === 1) {
            await redis.expire(key, windowSeconds);
        }
        return reqCount <= limit;
    } catch (e) {
        console.error("[SECURITY TRACE] Node TCP Limit Fault:", e);
        return true; // Failsafe Open to prevent locking out authentic backend traffic.
    }
}
