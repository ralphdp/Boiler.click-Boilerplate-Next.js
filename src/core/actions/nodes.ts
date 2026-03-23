"use server";

import { getAdminAuth, getAdminDb, getCollectionName } from "@/core/firebase/admin";
import { auth } from "@/core/auth";

export async function logAuditTrace(
    action: string,
    severity: 'INFO' | 'WARN' | 'CRIT',
    message: string,
    user: string = "SYSTEM",
    canon: 'UNITY' | 'PARSIMONY' | 'RECURSION' = 'UNITY'
) {
    try {
        const db = getAdminDb();
        await db.collection(getCollectionName("omni_audit_traces")).add({
            action,
            severity,
            message,
            canon,
            timestamp: Date.now(),
            user
        });
    } catch (e) {
        console.error("Failed to log audit trace:", e);
    }
}

export async function getSovereignNodes(maxResults = 100) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    if (!isRootAdmin) {
        throw new Error("UNAUTHORIZED_ACCESS: Clearance level insufficient.");
    }

    try {
        const authAdmin = getAdminAuth();
        const listUsersResult = await authAdmin.listUsers(maxResults);

        return listUsersResult.users.map(u => ({
            uid: u.uid,
            email: u.email,
            displayName: u.displayName || "Unknown Node",
            creationTime: u.metadata.creationTime,
            lastSignInTime: u.metadata.lastSignInTime,
            provider: u.providerData[0]?.providerId || "native",
            customClaims: u.customClaims || {},
            disabled: u.disabled
        }));
    } catch (e: any) {
        console.error("[Admin Substrate Error]:", e);
        throw new Error("Failed to retrieve node mapping. See logs.");
    }
}

export async function setNodeStatus(uid: string, disabled: boolean) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    if (!isRootAdmin) {
        throw new Error("UNAUTHORIZED_ACCESS: Only existing Root Administrators can alter node status.");
    }

    try {
        const authAdmin = getAdminAuth();
        await authAdmin.updateUser(uid, { disabled });
        await logAuditTrace("NODE_STATUS_CHANGE", "CRIT", disabled ? "Node banned" : "Node authorized", session?.user?.email || "SYSTEM", "UNITY");
        return { success: true, message: `Node successfully ${disabled ? 'banned' : 'authorized'}.` };
    } catch (e: any) {
        console.error("[Admin Node Status Fault]:", e);
        return { error: true, message: "Status update failed. Node may not exist." };
    }
}

export async function setNodeRole(uid: string, role: "ADMIN" | "USER") {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    if (!isRootAdmin) {
        throw new Error("UNAUTHORIZED_ACCESS: Root clearance required.");
    }

    try {
        const authAdmin = getAdminAuth();
        await authAdmin.setCustomUserClaims(uid, { role });
        await logAuditTrace("NODE_ROLE_CHANGE", "WARN", `Node role adjusted to ${role}`, session?.user?.email || "SYSTEM", "PARSIMONY");
        return { success: true, message: `Node successfully updated to ${role}.` };
    } catch (e: any) {
        console.error("[Admin Node Role Fault]:", e);
        return { error: true };
    }
}

export async function bulkUpdateNodeRoles(uids: string[], role: "ADMIN" | "USER") {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    const authAdmin = getAdminAuth();
    for (const uid of uids) {
        await authAdmin.setCustomUserClaims(uid, { role });
    }
    await logAuditTrace("BULK_ROLE_CHANGE", "WARN", `Bulk adjusted ${uids.length} nodes to ${role}`, session?.user?.email || "SYSTEM", "PARSIMONY");
    return { success: true, message: `Successfully adjusted ${uids.length} nodes to ${role}.` };
}

export async function bulkUpdateNodeStatus(uids: string[], disabled: boolean) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    const authAdmin = getAdminAuth();
    for (const uid of uids) {
        await authAdmin.updateUser(uid, { disabled });
    }
    await logAuditTrace("BULK_STATUS_CHANGE", "CRIT", `Bulk adjusted ${uids.length} nodes to ${disabled ? 'Banned' : 'Authorized'}`, session?.user?.email || "SYSTEM", "UNITY");
    return { success: true, message: `Successfully ${disabled ? 'banned' : 'authorized'} ${uids.length} nodes.` };
}

export async function exportSovereignNodesCSV() {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!isRootAdmin) throw new Error("UNAUTHORIZED");

    const nodes = await getSovereignNodes(1000);
    const headers = ["UID", "Email", "Name", "Role", "Status", "Created"];
    const rows = nodes.map(n => [
        n.uid,
        n.email,
        n.displayName,
        n.customClaims.role || "USER",
        n.disabled ? "Banned" : "Authorized",
        n.creationTime
    ]);

    const csvContent = [
        headers.join(","),
        ...rows.map(r => r.map(c => `"${c}"`).join(","))
    ].join("\n");

    return { success: true, csv: csvContent, message: "Identity Matrix exported successfully." };
}

export async function getUserAuditTraces(limitCount = 50) {
    const session = await auth();
    if (!session?.user?.email) throw new Error("UNAUTHORIZED");

    try {
        const db = getAdminDb();
        try {
            const snapshot = await db.collection(getCollectionName("omni_audit_traces"))
                .where("user", "==", session.user.email)
                .orderBy("timestamp", "desc")
                .limit(limitCount)
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (indexError: any) {
            console.warn("[Substrate Audit] Primary composite index missing. Executing VFS memory fallback array sort.");
            // VFS Hardened Fallback if composite index (user ASC, timestamp DESC) is missing
            const snapshot = await db.collection(getCollectionName("omni_audit_traces"))
                .where("user", "==", session.user.email)
                .get();

            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return docs.sort((a: any, b: any) => b.timestamp - a.timestamp).slice(0, limitCount);
        }
    } catch (e) {
        console.error("Failed to fetch user audit traces:", e);
        return [];
    }
}

export async function getAuditTraces(limitCount = 20) {
    const session = await auth();
    const isRootAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    if (!isRootAdmin) {
        throw new Error("UNAUTHORIZED");
    }

    try {
        const db = getAdminDb();
        const snapshot = await db.collection(getCollectionName("omni_audit_traces"))
            .orderBy("timestamp", "desc")
            .limit(limitCount)
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (e) {
        console.error("Failed to fetch audit traces:", e);
        return [];
    }
}
