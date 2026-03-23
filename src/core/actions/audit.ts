import { getAdminDb, getCollectionName } from "@/core/firebase/admin";
export { logAuditTrace } from "./nodes";

export type AuditSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface AuditLogPayload {
    workspaceId: string;
    actor: {
        id: string;
        email: string;
        name?: string;
    };
    action: string;
    resource: string;
    description: string;
    metadata?: Record<string, any>;
    severity?: AuditSeverity;
}

/**
 * Emits a high-fidelity audit trail into the workspace's partition.
 * Enforces schema compliance and automatic timestamping.
 */
export async function emitAuditLog(payload: AuditLogPayload) {
    try {
        const db = getAdminDb();
        const collectionPath = getCollectionName("omni_workspaces");

        const logEntry = {
            actor: payload.actor,
            action: payload.action,
            resource: payload.resource,
            description: payload.description,
            metadata: payload.metadata || {},
            severity: payload.severity || "INFO",
            timestamp: Date.now(),
        };

        await db
            .collection(collectionPath)
            .doc(payload.workspaceId)
            .collection("audit_logs")
            .add(logEntry);

        // Optionally, if severity is CRITICAL, we could emit a webhook or email alert here in the future

        return { success: true };
    } catch (e) {
        console.error("[AUDIT MATRIX] Failed to emit secure logger:", e);
        return { success: false, error: "Audit emission failed." };
    }
}
