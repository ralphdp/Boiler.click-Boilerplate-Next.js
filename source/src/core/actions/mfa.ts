"use server";

import { auth } from "@/core/auth";
import { getAdminDb } from "@/core/firebase/admin";
import { cookies } from "next/headers";
import { generateSecret, generateURI, verifySync, NobleCryptoPlugin, ScureBase32Plugin } from 'otplib';
import QRCode from 'qrcode';
import { logAuditTrace } from "./admin";

// Configure defaults for Sovereign entropy standards
const crypto = new NobleCryptoPlugin();
const base32 = new ScureBase32Plugin();

export async function generateMFASecret() {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.email) throw new Error("UNAUTHORIZED");

    const secret = generateSecret({ length: 20 });
    const otpauth = generateURI({
        secret,
        label: session.user.email,
        issuer: 'Vanguard Matrix', // Replace with your app name if needed
    });

    const qrCodeUrl = await QRCode.toDataURL(otpauth);

    // Store temporarily until verified
    const db = getAdminDb();
    await db.collection("users").doc(session.user.id).set({
        tempMfaSecret: secret
    }, { merge: true });

    return { qrCodeUrl, secret };
}

export async function verifyAndEnableMFA(token: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("UNAUTHORIZED");

    const db = getAdminDb();
    const userDoc = await db.collection("users").doc(session.user.id).get();

    if (!userDoc.exists) throw new Error("User record not found in Matrix.");
    const userData = userDoc.data();

    if (!userData?.tempMfaSecret) throw new Error("No pending MFA setup found.");

    const isValid = verifySync({ token, secret: userData.tempMfaSecret, crypto });

    if (isValid) {
        await db.collection("users").doc(session.user.id).update({
            mfaSecret: userData.tempMfaSecret,
            mfaEnabled: true,
            tempMfaSecret: null
        });

        const cookieStore = await cookies();
        cookieStore.set("mfa_verified", session.user.id, {
            path: "/",
            maxAge: 86400,
            secure: true,
            sameSite: "strict"
        });

        await logAuditTrace("MFA_ENABLED", "INFO", `TOTP MFA successfully bound to identity.`, session.user.email || "SYSTEM");
        return { success: true };
    } else {
        return { success: false, error: "Invalid TOTP Code." };
    }
}

export async function verifyLoginMFA(token: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("UNAUTHORIZED");

    const db = getAdminDb();
    const userDoc = await db.collection("users").doc(session.user.id).get();

    const userData = userDoc.data();
    if (!userData?.mfaEnabled || !userData?.mfaSecret) throw new Error("MFA not enabled.");

    const isValid = verifySync({ token, secret: userData.mfaSecret, crypto });

    if (isValid) {
        // Log the successful MFA verification in auth_sessions or update user login trace
        await db.collection("users").doc(session.user.id).update({
            lastLoginAt: Date.now()
        });

        const cookieStore = await cookies();
        cookieStore.set("mfa_verified", session.user.id, {
            path: "/",
            maxAge: 86400,
            secure: true,
            sameSite: "strict"
        });

        return { success: true };
    } else {
        return { success: false, error: "Invalid TOTP Code." };
    }
}

export async function disableMFA() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("UNAUTHORIZED");

    // Can optionally demand another TOTP code here to disable, simple approach first
    const db = getAdminDb();
    await db.collection("users").doc(session.user.id).update({
        mfaSecret: null,
        mfaEnabled: false
    });

    await logAuditTrace("MFA_DISABLED", "WARN", `TOTP MFA removed from identity.`, session.user.email || "SYSTEM");
    return { success: true };
}
