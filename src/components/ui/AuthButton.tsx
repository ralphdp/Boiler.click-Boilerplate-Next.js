"use client";

import { useSession, signOut } from "next-auth/react";
import { useTranslation } from "@/core/i18n/LanguageProvider";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { useEffect } from "react";

export function AuthButton() {
    const { data: session, status, update } = useSession();
    const { t, language } = useTranslation();
    const pathname = usePathname();

    useEffect(() => {
        if (status === "authenticated") {
            const pending = localStorage.getItem("pendingAuthMethod");
            if (pending) {
                localStorage.setItem("lastUsedAuthMethod", pending);
                localStorage.removeItem("pendingAuthMethod");
            }
        }
    }, [status]);

    if (status === "loading") {
        return (
            <Button
                variant="solid-accent"
                className="opacity-50 cursor-wait w-fit"
                tooltip="Synchronizing identity handshake with the authentication matrix."
                tooltipTerm="HANDSHAKE_PULSE"
            >
                {t.home.authenticating}
            </Button>
        );
    }

    if (session) {
        return (
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 w-fit ml-auto">
                {session?.user?.impersonating && (
                    <Button
                        variant="solid"
                        className="group bg-red-500/20 border-red-500/30 text-red-500 hover:bg-red-500/40 hover:text-white transition-colors font-semibold text-xs w-fit"
                        onClick={() => update({ revertImpersonation: true }).then(() => window.location.href = `/${language}/admin#nodes`)}
                        tooltip="Revert to original administrative identity and terminate impersonation."
                        tooltipTerm="GOD_MODE_REVERT"
                    >
                        {t.home.revertGodMode}
                    </Button>
                )}
                {(session?.user as any)?.activeWorkspace && (
                    <Button
                        variant="solid"
                        className="group bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-colors font-semibold text-xs w-fit"
                        onClick={() => update({ activeWorkspace: null })}
                        tooltip="Exit the current workspace and return to the root identity matrix."
                        tooltipTerm="WORKSPACE_EXIT"
                    >
                        {t.home.exitWorkspace}
                    </Button>
                )}
                {pathname !== "/dashboard" && pathname !== "/admin" && (
                    <Button
                        as={Link}
                        href={`/${language}/dashboard`}
                        variant="solid"
                        className="w-fit"
                        aria-label="Dashboard"
                        tooltip="Access your primary administrative dashboard and configuration nodes."
                        tooltipTerm="NAVIGATE_DASHBOARD"
                    >
                        {t.home.dashboard}
                    </Button>
                )}
                <Button
                    variant="solid-accent"
                    className="group w-fit"
                    onClick={() => signOut({ callbackUrl: `/${language}` })}
                    aria-label="Logout"
                    tooltip="Safely terminate the current handshake and clear identity buffers."
                    tooltipTerm="TERMINATE_SESSION"
                >
                    {t.home.terminateHandshake}
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>
        );
    }

    if (pathname === "/auth/handshake") {
        return (
            <Button
                as={Link}
                href={`/${language}`}
                variant="solid-accent"
                className="w-fit group"
                aria-label="Return to Dashboard"
                tooltip="Abort the current handshake and return to the primary landing node."
                tooltipTerm="ABORT_HANDSHAKE"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                {t.home.returnBtn}
            </Button>
        );
    }

    return (
        <Button
            as={Link}
            href={`/${language}/auth/handshake`}
            variant="solid-accent"
            className="w-fit"
            aria-label="Establish Handshake and login"
            tooltip="Initiate the secure identity handshake protocol to access the substrate."
            tooltipTerm="INITIALIZE_AUTH"
        >
            {t.home.establishHandshake}
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Button>
    );
}
