"use client";

import { Github, Chrome } from "lucide-react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/core/i18n/LanguageProvider";

export function SocialProviders({ lastUsed, markLastUsed }: { lastUsed?: string | null, markLastUsed?: (method: string) => void }) {
    const { t } = useTranslation();

    return (
        <div className="space-y-4">
            <Button
                variant="glass"
                onClick={() => {
                    markLastUsed?.("github");
                    signIn("github", { callbackUrl: "/" });
                }}
                className="w-full py-4 relative"
                aria-label="Sign in with GitHub"
            >
                <div className="flex items-center gap-2">
                    <Github size={16} /> {t.auth.github}
                </div>
                {lastUsed === "github" && (
                    <span className="absolute -top-[9px] right-6 text-[8px] bg-[var(--accent)] text-white h-[18px] px-2 flex items-center justify-center rounded-sm uppercase tracking-widest font-bold z-10 ring-1 ring-white/20 shadow-lg">
                        {t.auth.lastUsed}
                    </span>
                )}
            </Button>

            <Button
                variant="glass"
                onClick={() => {
                    markLastUsed?.("google");
                    signIn("google", { callbackUrl: "/" });
                }}
                className="w-full py-4 relative"
                aria-label="Sign in with Google"
            >
                <div className="flex items-center gap-2">
                    <Chrome size={16} /> {t.auth.google}
                </div>
                {lastUsed === "google" && (
                    <span className="absolute -top-[9px] right-6 text-[8px] bg-[var(--accent)] text-white h-[18px] px-2 flex items-center justify-center rounded-sm uppercase tracking-widest font-bold z-10 ring-1 ring-white/20 shadow-lg">
                        {t.auth.lastUsed}
                    </span>
                )}
            </Button>
        </div>
    );
}
