"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { checkSessionValidity } from "@/core/actions/session";
import { usePathname } from "next/navigation";

export function SessionRevalidator() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [hasHydrated, setHasHydrated] = useState(false);

    useEffect(() => {
        setHasHydrated(true);
    }, []);

    useEffect(() => {
        if (!hasHydrated || !session?.user) return;

        // Skip polling on the admin root if checking causes unnecessary re-renders (optional)
        // But for maximum security, we should run this globally.

        const validate = async () => {
            const status = await checkSessionValidity();
            if (!status.valid) {
                console.warn("[SECURITY] Session is no longer valid. Forcing eviction.");
                await signOut({ callbackUrl: "/" });
                return;
            }

            // Check if the user's role changed (e.g. ADMIN downgraded to USER) while sitting on an /admin page
            if (status.dbRole && status.dbRole !== session.user.role && pathname.includes("/admin")) {
                console.warn("[SECURITY] Role mutation detected while inside restricted sector. Evicting.");
                await signOut({ callbackUrl: "/" });
                return;
            }

            // Check if all sessions were manually revoked via the Cryptographic Settings
            const iatSeconds = (session.user as any)?.iat; // NextAuth issues native "iat" in seconds
            const revokedTimestampMs = status.tokensValidAfterTime;

            if (iatSeconds && revokedTimestampMs) {
                const iatMs = iatSeconds * 1000;
                if (iatMs < revokedTimestampMs) {
                    console.warn("[SECURITY] Cryptographic Token revoked by sibling session. Executing Halting Protocol.");
                    await signOut({ callbackUrl: "/" });
                }
            }
        };

        // Run validation immediately on mount (if authed) and then every 45 seconds
        validate();

        const interval = setInterval(validate, 45000);
        return () => clearInterval(interval);

    }, [hasHydrated, session, pathname]);

    return null; // Silent logic wrapper
}
