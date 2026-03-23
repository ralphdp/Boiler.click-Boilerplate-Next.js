"use server";

import { getAdminAuth, getAdminDb, getCollectionName } from "@/core/firebase/admin";
import { auth } from "@/core/auth";
import { logAuditTrace } from "./nodes";

import { emitAuditLog } from "./audit";

export async function logWorkspaceAction(workspaceId: string, action: string, details: string) {
    const session = await auth();

    await emitAuditLog({
        workspaceId,
        actor: {
            id: session?.user?.id || "SYSTEM",
            email: session?.user?.email || "SYSTEM",
            name: session?.user?.name || "System Automated",
        },
        action: action,
        resource: "omni_workspaces",
        description: details,
        severity: "INFO",
    });
}

export async function createWorkspace(data: { name: string, description?: string }) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("UNAUTHORIZED_ACCESS: Authentication required.");

    const db = getAdminDb();

    // Create Workspace Document
    const workspaceRef = db.collection(getCollectionName("omni_workspaces")).doc();
    const ts = Date.now();

    await workspaceRef.set({
        name: data.name,
        description: data.description || "",
        createdAt: ts,
        ownerId: session.user.id,
        status: "ACTIVE"
    });

    // Add Owner to Members Subcollection
    await workspaceRef.collection("members").doc(session.user.id).set({
        role: "OWNER",
        email: session.user.email,
        joinedAt: ts
    });

    // Add Workspace to User's active Workspaces
    const userRef = db.collection(getCollectionName("users")).doc(session.user.id);
    await userRef.set({
        workspaces: {
            [workspaceRef.id]: { role: "OWNER", name: data.name }
        }
    }, { merge: true });

    await logAuditTrace("WORKSPACE_CREATED", "INFO", `Created workspace ${workspaceRef.id}`, session.user.email || "SYSTEM");
    await logWorkspaceAction(workspaceRef.id, "WORKSPACE_CREATED", `Workspace '${data.name}' initialized by owner.`);

    return { success: true, workspaceId: workspaceRef.id };
}

export async function getUserWorkspaces() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const db = getAdminDb();
    const userSnap = await db.collection(getCollectionName("users")).doc(session.user.id).get();

    if (!userSnap.exists) return [];

    const workspacesCache = userSnap.data()?.workspaces || {};
    const workspaceIds = Object.keys(workspacesCache);

    if (workspaceIds.length === 0) return [];

    // Fetch the actual workspace documents to ensure they aren't marked DELETED
    const refs = workspaceIds.map(id => db.collection(getCollectionName("omni_workspaces")).doc(id));
    const snaps = await db.getAll(...refs);

    const activeWorkspaces: any[] = [];
    snaps.forEach(snap => {
        if (snap.exists && snap.data()?.status !== "DELETED") {
            const id = snap.id;
            activeWorkspaces.push({ id, ...workspacesCache[id] });
        }
    });

    return activeWorkspaces;
}

export async function inviteWorkspaceMember(workspaceId: string, email: string, role: "ADMIN" | "EDITOR" | "VIEWER" = "VIEWER") {
    const session = await auth();
    if (!session?.user?.id) throw new Error("UNAUTHORIZED");

    const db = getAdminDb();
    const callerMemberSnap = await db.collection(getCollectionName("omni_workspaces")).doc(workspaceId).collection("members").doc(session.user.id).get();

    if (!callerMemberSnap.exists || !["OWNER", "ADMIN"].includes(callerMemberSnap.data()?.role)) {
        throw new Error("UNAUTHORIZED_ACCESS: Insufficient workspace clearance.");
    }

    try {
        const authAdmin = getAdminAuth();
        const targetUser = await authAdmin.getUserByEmail(email);

        await db.collection(getCollectionName("omni_workspaces")).doc(workspaceId).collection("members").doc(targetUser.uid).set({
            role,
            email,
            joinedAt: Date.now()
        });

        // Add to the user's workspace mapping
        const userRef = db.collection(getCollectionName("users")).doc(targetUser.uid);

        // Fetch workspace name
        const wsSnap = await db.collection(getCollectionName("omni_workspaces")).doc(workspaceId).get();
        const wsName = wsSnap.data()?.name || "Unknown Workspace";

        await userRef.set({
            workspaces: { [workspaceId]: { role, name: wsName } }
        }, { merge: true });

        await logAuditTrace("WORKSPACE_MEMBER_INVITED", "INFO", `Invited ${email} to ${workspaceId}`, session.user.email || "SYSTEM");
        await logWorkspaceAction(workspaceId, "MEMBER_INVITED", `Invited ${email} as ${role}.`);

        return { success: true };
    } catch (e: any) {
        console.error("Workspace Invite Error:", e);
        return { success: false, message: "Failed to invite user. Ensure they have registered first." };
    }
}

export async function softDeleteWorkspace(workspaceId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("UNAUTHORIZED");

    const db = getAdminDb();
    const callerMemberSnap = await db.collection(getCollectionName("omni_workspaces")).doc(workspaceId).collection("members").doc(session.user.id).get();

    if (!callerMemberSnap.exists || callerMemberSnap.data()?.role !== "OWNER") {
        throw new Error("UNAUTHORIZED_ACCESS: Only the Workspace Owner can delete the workspace.");
    }

    try {
        await db.collection(getCollectionName("omni_workspaces")).doc(workspaceId).update({
            status: "DELETED",
            deletedAt: Date.now(),
            deletedBy: session.user.id
        });

        await logWorkspaceAction(workspaceId, "WORKSPACE_SOFT_DELETED", "Workspace was soft-deleted by owner.");
        await logAuditTrace("WORKSPACE_SOFT_DELETED", "WARN", `Workspace ${workspaceId} soft-deleted.`, session.user.email || "SYSTEM");

        return { success: true };
    } catch (e) {
        console.error("Soft Delete Error:", e);
        return { success: false, message: "Storage Matrix error during soft delete." };
    }
}

export async function getWorkspaceAuditLogs(workspaceId: string) {
    const session = await auth();
    if (!session?.user?.id) return [];

    const db = getAdminDb();
    const callerMemberSnap = await db.collection(getCollectionName("omni_workspaces")).doc(workspaceId).collection("members").doc(session.user.id).get();

    if (!callerMemberSnap.exists) {
        throw new Error("UNAUTHORIZED_ACCESS: You must be a member to view audit logs.");
    }

    const snap = await db.collection(getCollectionName("omni_workspaces")).doc(workspaceId).collection("audit_logs")
        .orderBy("timestamp", "desc")
        .limit(50)
        .get();

    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
