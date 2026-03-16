"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { CommandPalette, CommandDefinition } from "./CommandPalette";
import { useTranslation } from "@/core/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { setUIVariant } from "@/core/actions/theme";
import { setHaltingProtocol, setSandboxMode, setPreLaunchMode, getTelemetryData } from "@/core/actions/admin";

export function GlobalCommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const { data: session } = useSession();
    const { t, language } = useTranslation();
    const { toast } = useToast();

    const sequenceRef = useRef<string[]>([]);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Memoize commands to prevent effect re-runs
    const commands = useMemo<CommandDefinition[]>(() => {
        const base: CommandDefinition[] = [
            { id: "go-home", name: t.commandPalette.navHome, shortcut: "G H", action: () => router.push(`/${language}`) },
            { id: "go-dashboard", name: t.commandPalette.navDashboard, shortcut: "G D", action: () => router.push(`/${language}/dashboard`) },
        ];

        if (session) {
            base.push({ id: "go-settings", name: t.commandPalette.accountSettings, shortcut: "G S", action: () => router.push(`/${language}/dashboard?tab=security`) });
            base.push({ id: "sign-out", name: t.commandPalette.signOut, action: () => signOut({ callbackUrl: `/${language}` }) });

            if (session.user?.role === "ADMIN") {
                base.push({ id: "go-admin", name: t.commandPalette.rootConsole, shortcut: "G A", action: () => router.push(`/${language}/admin`) });
                base.push({ id: "sys-audit", name: "System: Inspect Audit Matrix", shortcut: "A M", action: () => router.push(`/${language}/admin#audit`) });
                base.push({ id: "sys-vfs", name: "System: Inspect Source Integrity", shortcut: "V F S", action: () => router.push(`/${language}/admin#vfs`) });
                base.push({
                    id: "sys-diag", name: "System: Rapid Pulse Diagnostic", shortcut: "D", action: async () => {
                        setIsOpen(false);
                        const tel = await getTelemetryData();
                        toast({ title: "SUBSTRATE PULSE", description: `LATENCY: ${tel.latency}ms | OK`, type: "success" });
                    }
                });
            }
        } else {
            base.push({ id: "sign-in", name: t.commandPalette.signIn, action: () => router.push(`/${language}/auth/handshake`) });
        }

        base.push({ id: "theme-fire", name: t.commandPalette.themeFire, action: () => setUIVariant("fire").then(() => router.refresh()) });
        base.push({ id: "theme-matrix", name: t.commandPalette.themeMatrix, action: () => setUIVariant("matrix").then(() => router.refresh()) });

        return base;
    }, [session, language, t, router, toast]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen(prev => !prev);
                return;
            }

            if (e.key === "Escape") {
                setIsOpen(false);
                sequenceRef.current = [];
                return;
            }

            if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;

            const key = e.key.toUpperCase();
            sequenceRef.current.push(key);
            const sequenceStr = sequenceRef.current.join(" ");

            const matchedCommand = commands.find((cmd: CommandDefinition) => cmd.shortcut === sequenceStr);
            if (matchedCommand) {
                e.preventDefault();
                matchedCommand.action();
                setIsOpen(false);
                sequenceRef.current = [];
            } else {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                timeoutRef.current = setTimeout(() => { sequenceRef.current = []; }, 1000);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [commands]);

    return (
        <CommandPalette
            commands={commands}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
        />
    );
}
