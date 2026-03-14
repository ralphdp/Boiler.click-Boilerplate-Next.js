"use client";

import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function ForceMFA({ locale }: { locale: string }) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // If they are already on the settings page, DO NOT block the UI. Let them set it up!
    if (pathname.includes("/dashboard/settings")) {
        return null;
    }

    // Otherwise, render full screen overlay blocking the dashboard
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center text-center p-8 bg-black/90 backdrop-blur-3xl text-white">
            <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute top-1/4 -right-20 w-80 h-80 bg-[var(--accent)]/10 blur-[100px] rounded-full" />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[var(--accent)]/10 blur-[100px] rounded-full" />
            </div>

            <div className="z-10 bg-[#050505] border border-[var(--accent)]/30 p-10 max-w-lg w-full rounded-2xl shadow-[0_0_100px_rgba(0,230,118,0.1)] relative">
                <ShieldAlert className="w-16 h-16 text-[var(--accent)] mx-auto mb-6" />
                <h1 className="text-2xl font-black uppercase tracking-widest text-[var(--accent)] mb-4">SECURITY MANDATE</h1>
                <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] mb-8 leading-relaxed">
                    System Administrators have enforced a mandatory Authenticator Handshake (MFA) for workspaces.
                    <br /><br />
                    You cannot freely navigate the dashboard until a Cryptographic Authenticator is bound to your Identity.
                </p>

                <Button as={Link} href={`/${locale}/dashboard/settings?tab=security`} variant="glass-accent" className="w-full flex justify-center py-4">
                    PROCEED TO SECURITY SETTINGS
                </Button>
            </div>
        </div>
    );
}
