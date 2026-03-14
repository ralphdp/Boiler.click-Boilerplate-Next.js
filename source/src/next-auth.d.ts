import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role?: string;
            provider?: string;
            impersonating?: boolean;
            impersonatorId?: string;
            activeWorkspace?: string;
            tokensValidAfterTime?: number;
            mfaEnabled?: boolean;
            mfaVerified?: boolean;
        } & DefaultSession["user"];
    }

    interface User {
        role?: string;
        provider?: string;
    }
}
