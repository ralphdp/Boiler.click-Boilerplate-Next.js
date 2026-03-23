import { auth } from "@/core/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getAdminDb, getCollectionName } from "@/core/firebase/admin";
import { ForceMFA } from "@/components/ui/ForceMFA";

export default async function DashboardLayout({ children, params }: { children: React.ReactNode, params: Promise<{ locale: string }> }) {
    const session = await auth();
    const resolvedParams = await params;

    // Strict Halting Protocol: If a user is unauthenticated and tries to access /dashboard/*, bounce them.
    if (!session?.user) {
        redirect(`/${resolvedParams.locale}/auth/handshake?callbackUrl=/${resolvedParams.locale}/dashboard`);
    }

    // MFA Barrier
    const cookieStore = await cookies();
    const mfaVerifiedCookie = cookieStore.get("mfa_verified");

    // Check if they need to verify
    const userDoc = await getAdminDb().collection(getCollectionName("users")).doc(session.user.id).get();

    if (mfaVerifiedCookie?.value !== session.user.id) {
        // Fetch DB to see if MFA is even enabled
        if (userDoc.exists && userDoc.data()?.mfaEnabled) {
            // They have MFA enabled but no valid session cookie, redirect to MFA challenge
            redirect(`/${resolvedParams.locale}/auth/mfa`);
        }
    }

    let mfaEnforcedOnWorkspace = false;
    let hasWorkspaces = false;
    let mfaEnabled = false;

    // We check the DB for user's workspaces and if the global setting enforceMFA is true
    if (userDoc.exists) {
        const data = userDoc.data();
        mfaEnabled = !!data?.mfaEnabled;
        hasWorkspaces = Object.keys(data?.workspaces || {}).length > 0;
    }

    if (!mfaEnabled && hasWorkspaces) {
        // Only fetch config if we need it
        const configDoc = await getAdminDb().collection(getCollectionName("sovereign_config")).doc("global").get();
        if (configDoc.exists && configDoc.data()?.mfaEnforced) {
            mfaEnforcedOnWorkspace = true;
        }
    }

    return (
        <>
            {children}
            {mfaEnforcedOnWorkspace && <ForceMFA locale={resolvedParams.locale} />}
        </>
    );
}
