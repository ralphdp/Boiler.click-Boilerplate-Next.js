import NextAuth from "next-auth";
import { getOmniAdapter } from "./db/adapters";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: getOmniAdapter(),
});
