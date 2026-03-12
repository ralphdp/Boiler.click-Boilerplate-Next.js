"use client";

import { useSession, signOut } from "next-auth/react";
import { useTranslation } from "@/core/i18n/LanguageProvider";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { useEffect } from "react";

export function AuthButton() {
    const { data: session, status } = useSession();
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
            <Button variant="glass-accent" className="flex-1 opacity-50 cursor-wait">
                {t.home.authenticating}
            </Button>
        );
    }

    if (session) {
        return (
            <div className="flex items-center gap-4">
                {pathname !== "/dashboard" && pathname !== "/admin" && (
                    <Button
                        as={Link}
                        href={`/${language}/dashboard`}
                        variant="glass"
                        className="flex-1"
                        aria-label="Dashboard"
                    >
                        {t.home.dashboard}
                    </Button>
                )}
                <Button
                    variant="glass-accent"
                    className="flex-1 group"
                    onClick={() => signOut({ callbackUrl: `/${language}` })}
                    aria-label="Logout"
                >
                    {t.home.terminateHandshake}
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform ml-2" />
                </Button>
            </div>
        );
    }

    if (pathname === "/auth/handshake") {
        return (
            <Button
                as={Link}
                href={`/${language}`}
                variant="glass-accent"
                className="flex-1 group"
                aria-label="Return to Dashboard"
            >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform mr-2" />
                Return
            </Button>
        );
    }

    return (
        <Button
            as={Link}
            href={`/${language}/auth/handshake`}
            variant="glass-accent"
            className="flex-1"
            aria-label="Establish Handshake and login"
        >
            {t.home.establishHandshake}
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Button>
    );
}
