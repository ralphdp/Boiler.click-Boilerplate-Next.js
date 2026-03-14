"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { CommandPalette, CommandDefinition } from "./CommandPalette";
import { useTranslation } from "@/core/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { setUIVariant } from "@/core/actions/theme";

export function GlobalCommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const { data: session } = useSession();
    const { language } = useTranslation();
    const { toast } = useToast();

    // Key binding to open the palette
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const commands: CommandDefinition[] = [
        {
            id: "go-home",
            name: "Navigate: Home",
            shortcut: "G H",
            action: () => router.push(`/${language}`),
        },
        {
            id: "go-dashboard",
            name: "Navigate: Dashboard",
            shortcut: "G D",
            action: () => router.push(`/${language}/dashboard`),
        },
    ];

    if (session) {
        commands.push({
            id: "go-settings",
            name: "Account settings",
            shortcut: "G S",
            action: () => router.push(`/${language}/dashboard?tab=security`),
        });
        commands.push({
            id: "sign-out",
            name: "Terminate Handshake (Sign out)",
            action: () => {
                toast({ title: "Terminating Session", description: "Closing secure handshake...", type: "warning" });
                signOut({ callbackUrl: `/${language}` });
            },
        });

        if (session.user?.role === "ADMIN") {
            commands.push({
                id: "go-admin",
                name: "System: Root Console",
                shortcut: "G A",
                action: () => router.push(`/${language}/admin`),
            });
        }
    } else {
        commands.push({
            id: "sign-in",
            name: "Establish Handshake (Sign in)",
            action: () => router.push(`/${language}/auth/handshake`),
        });
    }

    // Add some theme commands as an example
    commands.push({
        id: "theme-fire",
        name: "Set UI Variant: Fire",
        action: async () => {
            await setUIVariant("fire");
            router.refresh();
        },
    });

    commands.push({
        id: "theme-matrix",
        name: "Set UI Variant: Matrix",
        action: async () => {
            await setUIVariant("matrix");
            router.refresh();
        },
    });

    commands.push({
        id: "theme-galaxy",
        name: "Set UI Variant: Galaxy",
        action: async () => {
            await setUIVariant("galaxy");
            router.refresh();
        },
    });

    commands.push({
        id: "theme-none",
        name: "Set UI Variant: None (Performance Mode)",
        action: async () => {
            await setUIVariant("none");
            router.refresh();
        },
    });

    return (
        <CommandPalette
            commands={commands}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
        />
    );
}
