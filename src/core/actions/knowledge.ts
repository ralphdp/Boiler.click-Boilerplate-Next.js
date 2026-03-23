"use server";
import { auth } from "@/core/auth";

/**
 * PRO-G40 BRIDGE: Deep-Parse the Logos Total Corpus
 * Returns relevant 'Jewels' matching the query.
 */
export async function deepParseCorpus(query: string) {
    const session = await auth();
    if (!session) throw new Error("UNAUTHORIZED: Handshake Required.");

    const path = require('path');
    const CORPUS_PATH = path.resolve(process.cwd(), process.env.LOGOS_CORPUS_PATH || "src/core/knowledge/corpus.md");

    try {
        const fs = await import("fs");
        if (!fs.existsSync(CORPUS_PATH)) {
            return { success: false, error: "Bridge path offline." };
        }

        const content = fs.readFileSync(CORPUS_PATH, "utf-8");
        const jewels = content.split("--- JEWEL:");

        const results = jewels.filter(j => j.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 5)
            .map(j => "--- JEWEL:" + j.trim());

        return { success: true, results };
    } catch (e: any) {
        console.error("[PRO-G40 Bridge Fault]:", e);
        return { success: false, error: "Bridge failure: " + e.message };
    }
}
