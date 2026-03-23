import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import Resend from "next-auth/providers/resend";
import { sendVanguardEmail } from "./email/service";
import MagicLink from "./email/templates/MagicLink";
import type { NextAuthConfig } from "next-auth";
import { getEdgeConfig } from "./security/edge-config";
import { SecurityUtils } from "./security/security-config";

// Explicit global declarations from next-auth.d.ts ensure the user and token objects are strictly typed.

export const authConfig = {
    providers: [
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
        Resend({
            apiKey: process.env.RESEND_API_KEY,
            from: process.env.RESEND_DEFAULT_FROM || "Boilerplate <noreply@boiler.click>",
            sendVerificationRequest: async ({ identifier, url, provider }) => {
                const host = new URL(url).host;
                await sendVanguardEmail({
                    to: identifier,
                    subject: `Log In To ${host}`,
                    template: MagicLink({ url, host }),
                });
            }
        }),
        Credentials({
            name: "Sovereign Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
                if (!apiKey) {
                    console.error("[AUTH] Fatal: NEXT_PUBLIC_FIREBASE_API_KEY is missing from .env.local. Cannot verify Firebase credentials.");
                    return null;
                }

                try {
                    // Authenticate strictly against the genuine Firebase Auth backend via the Secure REST API
                    const res = await fetch(
                        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                email: credentials.email,
                                password: credentials.password,
                                returnSecureToken: true,
                            }),
                        }
                    );

                    const data = await res.json();

                    if (!res.ok) {
                        console.warn(`[AUTH] Firebase Credentials mismatch: ${data.error?.message || 'Unknown Error'}`);
                        return null;
                    }

                    // Return the genuine user payload derived from Firebase Authentication
                    return {
                        id: data.localId,
                        name: data.displayName || (credentials.email as string).split('@')[0],
                        email: data.email,
                    };
                } catch (error) {
                    console.error("[AUTH] Substrate Failure during Firebase REST auth:", error);
                    return null;
                }
            }
        })
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async signIn({ user }) {
            try {
                const config = await getEdgeConfig();
                if (config.domainShield && user.email) {
                    if (SecurityUtils.isDomainBlocked(user.email)) {
                        console.warn(`[VANGUARD SHIELD] Identity Rejection: Domain Blacklisted for ${user.email}`);
                        return false;
                    }
                }
            } catch (e) {
                console.error("[VANGUARD SHIELD ERROR]:", e);
            }
            return true;
        },
        async jwt({ token, user, account, trigger, session }) {
            // NextAuth Client Session Trigger Intercept
            if (trigger === "update" && session) {
                if (session.name) token.name = session.name;
                if (session.picture) token.picture = session.picture; // Using standard NextAuth fields
                if (session.activeWorkspace !== undefined) token.activeWorkspace = session.activeWorkspace;
                if (session.tokensValidAfterTime) token.tokensValidAfterTime = session.tokensValidAfterTime;

                // God Mode Impersonation Logic
                if (session.impersonateId) {
                    // Only root admins can trigger impersonation
                    if (token.role === "ADMIN" || token.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) {
                        if (!token.impersonatorId) {
                            token.impersonatorId = token.id; // Save true identity
                            token.impersonatorEmail = token.email; // Save true email
                            token.impersonatorRole = token.role; // Save true role
                            token.impersonatorName = token.name; // Save true name
                        }
                        token.id = session.impersonateId;
                        token.email = session.impersonateEmail || token.email;
                        token.role = session.impersonateRole || "USER";
                        if (session.impersonateName) token.name = session.impersonateName;
                        token.impersonating = true;
                    }
                }

                if (session.revertImpersonation) {
                    if (token.impersonatorId) {
                        token.id = token.impersonatorId;
                        token.email = token.impersonatorEmail as string;
                        token.role = token.impersonatorRole as string;
                        if (token.impersonatorName !== undefined) {
                            token.name = token.impersonatorName as string;
                        }
                        token.impersonating = false;
                        token.impersonatorId = undefined;
                        token.impersonatorEmail = undefined;
                        token.impersonatorRole = undefined;
                        token.impersonatorName = undefined;
                    }
                }
            }

            if (account) {
                token.provider = account.provider;
            }
            if (user) {
                token.id = user.id as string;
                // Safely assign ADMIN role across all auth providers (Credentials and OAuth)
                token.role = user.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL ? 'ADMIN' : 'USER';

                // Fetch security status from Substrate DB
                try {
                    const { getAdminDb, getCollectionName } = await import("./firebase/admin");
                    const db = getAdminDb();
                    const userDoc = await db.collection(getCollectionName("users")).doc(user.id as string).get();
                    if (userDoc.exists) {
                        const data = userDoc.data();
                        token.mfaEnabled = data?.mfaEnabled || false;
                        token.tokensValidAfterTime = data?.tokensValidAfterTime || 0;
                    }
                } catch (e) {
                    console.error("[AUTH] Security sync fault:", e);
                }
            }

            // Periodic Security Audit: Re-verify revocation timestamp from DB every 60 seconds
            const uid = token.id as string;
            const now = Date.now();
            const lastAuthCheck = (token.lastAuthCheck as number) || 0;

            if (uid && (now - lastAuthCheck > 60000)) { // 60s TTL for local node status
                try {
                    const { getAdminDb, getCollectionName } = await import("./firebase/admin");
                    const db = getAdminDb();
                    const userDoc = await db.collection(getCollectionName("users")).doc(uid).get();
                    if (userDoc.exists) {
                        const data = userDoc.data();
                        token.tokensValidAfterTime = data?.tokensValidAfterTime || 0;
                        token.mfaEnabled = data?.mfaEnabled || false;
                        token.lastAuthCheck = now;
                    }
                } catch (e) {
                    console.error("[AUTH] Substrate Heartbeat Fault:", e);
                }
            }

            // Strict Revocation Gate: If the token was issued BEFORE the revocation timestamp, it's void.
            if (token.iat && token.tokensValidAfterTime && (token.iat as number * 1000) < (token.tokensValidAfterTime as number)) {
                console.warn("[AUTH] Revoking session: Token predates severance timestamp.");
                return null;
            }

            if (trigger === "update" && (session as any)?.mfaEnabled !== undefined) {
                token.mfaEnabled = (session as any).mfaEnabled;
            }

            // Session Stewardship: Track active node connections with High-Fidelity Heartbeat
            try {
                if (uid) {
                    const now = Date.now();
                    const lastStewardshipCheck = (token.lastStewardshipCheck as number) || 0;

                    // Identity Stabilization: Use a stable Session ID instead of the rotating JTI to prevent audit replication
                    if (!token.sid) {
                        token.sid = Math.random().toString(36).substring(2) + Date.now().toString(36);
                    }
                    const sid = token.sid as string;

                    // Only update the Substrate Matrix every 10 minutes to prevent DB spam during navigation
                    if (now - lastStewardshipCheck > 600000) {
                        const { getAdminDb, getCollectionName } = await import("./firebase/admin");
                        const { headers } = await import("next/headers");

                        const db = getAdminDb();
                        const headerList = await headers();
                        const userAgent = headerList.get("user-agent") || "Unknown Substrate";

                        const sessionData = {
                            lastSeen: now,
                            userAgent: userAgent,
                            nodeType: typeof window === "undefined" ? "CLOUD_NODE" : "CLIENT_NODE"
                        };

                        await db.collection(getCollectionName("users"))
                            .doc(uid)
                            .collection("active_sessions")
                            .doc(sid)
                            .set(sessionData, { merge: true });

                        token.lastStewardshipCheck = now;
                    }
                }
            } catch (e) {
                console.error("[SESSION STEWARDSHIP] Fault:", e);
            }

            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.provider = token.provider as string;
                session.user.mfaEnabled = token.mfaEnabled as boolean;
                if (token.email) session.user.email = token.email as string;

                // God Mode variables mapping
                if (token.impersonating) {
                    session.user.impersonating = token.impersonating as boolean;
                    session.user.impersonatorId = token.impersonatorId as string;
                } else {
                    session.user.impersonating = false;
                }

                // Explicitly rehydrate dynamic session values modified by trigger === "update"
                if (token.name) session.user.name = token.name;
                if (token.picture) session.user.image = token.picture as string;
                if (token.activeWorkspace) session.user.activeWorkspace = token.activeWorkspace as string;
                if (token.tokensValidAfterTime) session.user.tokensValidAfterTime = token.tokensValidAfterTime as number;

                // Add issue time for strict revocation comparison
                if (token.iat) session.user.iat = token.iat;
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/handshake',
    }
} satisfies NextAuthConfig;
