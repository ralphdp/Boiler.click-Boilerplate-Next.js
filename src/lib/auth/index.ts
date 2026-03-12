import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            role?: string;
        } & DefaultSession['user'];
    }
}

/**
 * Sovereign Authentication Strategy Interface
 * Defines the contract for all authentication providers.
 */
export interface AuthStrategy {
    name: string;
    authenticate: (credentials: Record<string, string>) => Promise<any>;
    validateSession: (token: string) => Promise<boolean>;
}

// Implementations for different providers would go here:
// 1. Supabase Auth
// 2. NextAuth (OAuth, standard credentials)
// 3. Custom JWT Flow
