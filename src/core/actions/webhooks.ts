"use server";

import { getAdminDb } from "@/core/firebase/admin";
import { auth } from "@/core/auth";
import { logWorkspaceAction } from "./workspaces";
import crypto from "crypto";

export async function registerWebhook(workspaceId: string, url: string, description: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("UNAUTHORIZED");

    const db = getAdminDb();
    const callerMemberSnap = await db.collection("omni_workspaces").doc(workspaceId).collection("members").doc(session.user.id).get();

    if (!callerMemberSnap.exists || !["OWNER", "ADMIN"].includes(callerMemberSnap.data()?.role)) {
        throw new Error("UNAUTHORIZED_ACCESS: Only ADMINs can register webhooks.");
    }

    try {
        const secret = crypto.randomBytes(32).toString('hex');

        await db.collection("omni_workspaces").doc(workspaceId).collection("webhooks").add({
            url,
            description,
            secret, // Store secret for generating HMAC later
            createdAt: Date.now(),
            createdBy: session.user.id,
            active: true
        });

        await logWorkspaceAction(workspaceId, "WEBHOOK_REGISTERED", `Webhook registered for ${url}`);

        // Asynchronously trigger a test payload to the newly minted webhook
        triggerWebhook(workspaceId, "webhook.mounted", { status: "ACTIVE", url, message: "Cryptographic integration confirmed." }).catch(e => console.error(e));

        return { success: true };
    } catch (e) {
        console.error("Webhook Registration Failed:", e);
        return { success: false, message: "Matrix fault during webhook binding." };
    }
}

export async function getWorkspaceWebhooks(workspaceId: string) {
    const session = await auth();
    if (!session?.user?.id) return [];

    const db = getAdminDb();
    const snap = await db.collection("omni_workspaces").doc(workspaceId).collection("webhooks").get();

    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function triggerWebhook(workspaceId: string, eventType: string, payload: any) {
    const db = getAdminDb();
    const snap = await db.collection("omni_workspaces").doc(workspaceId).collection("webhooks").where("active", "==", true).get();

    if (snap.empty) return;

    const body = JSON.stringify({
        event: eventType,
        timestamp: Date.now(),
        data: payload
    });

    snap.forEach(async (doc) => {
        const webhook = doc.data();
        const signature = crypto.createHmac('sha256', webhook.secret).update(body).digest('hex');

        try {
            const response = await fetch(webhook.url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Vanguard-Signature": signature,
                    "X-Vanguard-Event": eventType
                },
                body
            });

            // Optionally log delivery trace in database
            await db.collection("omni_workspaces").doc(workspaceId).collection("webhook_deliveries").add({
                webhookId: doc.id,
                event: eventType,
                status: response.status,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error(`Webhook delivery failure to ${webhook.url}:`, error);
        }
    });
}
