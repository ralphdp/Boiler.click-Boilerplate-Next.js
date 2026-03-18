import { Redis } from "@upstash/redis";

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
}

const GLOBAL_CONFIG_KEY = "config:global";

export async function getEdgeConfig(): Promise<Record<string, any>> {
    const fallback = {
        haltingProtocol: false,
        preLaunchMode: false,
        maintenanceMode: false
    };

    if (!redis) return fallback;

    try {
        const data = await redis.hgetall(GLOBAL_CONFIG_KEY);
        if (!data) return fallback;

        return {
            haltingProtocol: data.haltingProtocol === "true",
            preLaunchMode: data.preLaunchMode === "true",
            maintenanceMode: data.maintenanceMode === "true",
            domainShield: data.domainShield === "true",
            broadcast: data.broadcast as string || ""
        };
    } catch (e) {
        console.error("[EDGE CONFIG FAULT]:", e);
        return fallback;
    }
}

export async function updateEdgeConfig(updates: Record<string, any>) {
    if (!redis) return;

    try {
        const stringifiedUpdates: Record<string, string> = {};
        Object.entries(updates).forEach(([k, v]) => {
            stringifiedUpdates[k] = String(v);
        });
        await redis.hset(GLOBAL_CONFIG_KEY, stringifiedUpdates);
    } catch (e) {
        console.error("[EDGE CONFIG WRITE FAULT]:", e);
    }
}
