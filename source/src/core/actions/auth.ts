"use server";

import { getAdminAuth, getAdminDb } from "@/core/firebase/admin";
import { Resend } from "resend";
import { ACTIVE_THEME } from "@/theme/config";
import { getGlobalOverrides } from "@/core/actions/admin";
import { auth } from "@/core/auth";

const resend = new Resend(process.env.RESEND_API_KEY || "re_fallback");

export async function sendCustomPasswordResetEmail(email: string, locale: string = "en") {
    if (!email) throw new Error("Email string required for Sovereign Password Recovery.");

    try {
        // Generate the Firebase Reset Link securely on the Backend Edge
        const authAdmin = getAdminAuth();
        const firebaseLink = await authAdmin.generatePasswordResetLink(email);

        // Extract the raw cryptographic token and build a native platform route
        const urlObj = new URL(firebaseLink);
        const oobCode = urlObj.searchParams.get("oobCode");
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const resetLink = `${siteUrl}/${locale}/auth/reset-password?oobCode=${oobCode}`;

        const overrides = await getGlobalOverrides();
        const fromEmail = overrides.resendFrom;

        // Dispatch via Resend skipping Firebase's rigid templating
        const { error } = await resend.emails.send({
            from: `${ACTIVE_THEME.siteName} <${fromEmail}>`,
            to: [email],
            subject: `Cryptographic Handshake Reset: ${ACTIVE_THEME.siteName}`,
            html: `
                <div style="font-family: monospace, sans-serif; background: #000; color: #fff; padding: 40px; text-transform: uppercase;">
                    <h1 style="color: ${ACTIVE_THEME.primaryColor}; letter-spacing: 0.2em; font-size: 24px; margin-bottom: 24px;">SOVEREIGN IDENTITY MATRIX</h1>
                    <p style="opacity: 0.8; letter-spacing: 0.1em; line-height: 1.6; margin-bottom: 16px;">
                        A Cryptographic Handshake Reset was requested for your node linking to <strong>${email}</strong>.<br/><br/>
                        Click the terminal uplink below to securely redefine your access cipher.
                    </p>
                    
                    <a href="${resetLink}" style="display: inline-block; background: ${ACTIVE_THEME.primaryColor}; color: #000; padding: 16px 32px; font-weight: bold; text-decoration: none; letter-spacing: 0.2em; margin-bottom: 32px;">OVERRIDE CIPHER GLOBALLY</a>

                    <p style="opacity: 0.5; font-size: 10px; letter-spacing: 0.1em; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">
                        If you did not initiate this handshake, discard this transmission immediately. Your underlying authorization matrix remains intact.
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error("[Email Transport Matrix Fault]", error);
            throw new Error("Resend Dispatch Failed.");
        }

        return { success: true };
    } catch (e: any) {
        console.error("[Sovereign Auth Reset Error]:", e);
        throw new Error("Unable to execute Password Reset Protocol. Check server logs.");
    }
}

export async function generateSovereignCustomToken(uid: string) {
    if (!uid) throw new Error("UID string required for Sovereign Token Generation.");

    try {
        const authAdmin = getAdminAuth();
        const customToken = await authAdmin.createCustomToken(uid);
        return { success: true, customToken };
    } catch (e: any) {
        console.error("[Sovereign Token Matrix Fault]:", e);
        throw new Error("Unable to execute Custom Token Protocol. Verify server config.");
    }
}

export async function registerSovereignNode(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "VALIDATION_FAULT", message: "Email and password are required to establish an identity node." };
    }

    try {
        const authAdmin = getAdminAuth();

        // Ensure user doesn't already exist
        try {
            await authAdmin.getUserByEmail(email);
            return { error: "DUPLICATE_FAULT", message: "An identity matrix under this designation already exists." };
        } catch (e: any) {
            // It threw an error, meaning user doesn't exist, which is what we want!
            if (e.code !== 'auth/user-not-found') throw e;
        }

        // Register the user natively via Firebase Admin
        const userRecord = await authAdmin.createUser({
            email,
            password,
            emailVerified: false,
            displayName: email.split("@")[0]
        });

        return { success: true, uid: userRecord.uid };
    } catch (e: any) {
        console.error("[Node Creation Fault]:", e);
        return { error: "REGISTRATION_FAULT", message: e.message || "Failed to establish a new Identity Node." };
    }
}

export async function revokeAllSessions() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("UNAUTHORIZED");

    try {
        const authAdmin = getAdminAuth();
        const db = getAdminDb();
        const uid = session.user.id;
        const now = Date.now();

        // Natively revoke Firebase Refresh Tokens across all devices
        await authAdmin.revokeRefreshTokens(uid);

        // Update the database to force NextAuth JWTs to instantly expire
        await db.collection("users").doc(uid).set({
            tokensValidAfterTime: now
        }, { merge: true });

        return { success: true, timestamp: now };
    } catch (error) {
        console.error("Failed to revoke sibling sessions:", error);
        return { success: false, message: "Matrix fault during cryptographic revocation." };
    }
}
