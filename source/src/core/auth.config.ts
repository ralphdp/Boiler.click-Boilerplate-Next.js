import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

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
        async jwt({ token, user, account, trigger, session }) {
            // NextAuth Client Session Trigger Intercept
            if (trigger === "update" && session) {
                if (session.name) token.name = session.name;
                if (session.image) token.picture = session.image;
            }

            if (account) {
                token.provider = account.provider;
            }
            if (user) {
                token.id = user.id as string;
                // Safely assign ADMIN role across all auth providers (Credentials and OAuth)
                token.role = user.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL ? 'ADMIN' : 'USER';
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.provider = token.provider as string;

                // Explicitly rehydrate dynamic session values modified by trigger === "update"
                if (token.name) session.user.name = token.name;
                if (token.picture) session.user.image = token.picture as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/handshake',
    }
} satisfies NextAuthConfig;
