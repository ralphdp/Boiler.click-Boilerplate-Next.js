import { FirestoreAdapter } from "@auth/firebase-adapter";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getAdminDb } from "../firebase/admin";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import type { Adapter } from "next-auth/adapters";

const DATABASE_PROVIDER = process.env.DATABASE_PROVIDER || "firebase";

export function getOmniAdapter(): Adapter {
    if (DATABASE_PROVIDER === "neon") {
        if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing for Neon DB.");
        const sql = neon(process.env.DATABASE_URL);
        const db = drizzleNeon(sql);
        return DrizzleAdapter(db) as Adapter;
    }

    if (DATABASE_PROVIDER === "supabase") {
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error("Supabase keys are missing for Supabase adapter.");
        }
        return SupabaseAdapter({
            url: process.env.SUPABASE_URL,
            secret: process.env.SUPABASE_SERVICE_ROLE_KEY,
        }) as Adapter;
    }

    // Default to Firebase Adapter
    const db = getAdminDb();
    const prefix = process.env.DATABASE_PREFIX || "";
    const customCollections = prefix ? {
        users: `${prefix}users`,
        accounts: `${prefix}accounts`,
        sessions: `${prefix}sessions`,
        verificationTokens: `${prefix}verificationTokens`,
    } : undefined;

    return FirestoreAdapter({
        firestore: db,
        collections: customCollections
    }) as Adapter;
}
