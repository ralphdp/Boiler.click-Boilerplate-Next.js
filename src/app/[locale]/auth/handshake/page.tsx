"use client";

import { useState, Suspense, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ACTIVE_THEME } from "@/theme/config";
import { Shield, Mail } from "lucide-react";
import { SolidCard } from "@/components/ui/SolidCard";
import { Button } from "@/components/ui/Button";
import { SocialProviders } from "@/components/auth/SocialProviders";
import { CredentialsForm } from "@/components/auth/CredentialsForm";
import { MagicLinkForm } from "@/components/auth/MagicLinkForm";
import { useTranslation } from "@/core/i18n/LanguageProvider";
import { useFeatureFlags } from "@/core/hooks/useFeatureFlags";

export default function HandshakePage() {
    const { t } = useTranslation();
    const { modules } = useFeatureFlags();
    const [isCredentialsMode, setIsCredentialsMode] = useState(false);
    const [isMagicLinkMode, setIsMagicLinkMode] = useState(false);
    const [lastUsed, setLastUsed] = useState<string | null>(null);

    useEffect(() => {
        setLastUsed(localStorage.getItem("lastUsedAuthMethod"));
    }, []);

    const markPendingAuth = (method: string) => {
        localStorage.setItem("pendingAuthMethod", method);
    };

    return (
        <main className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden font-sans text-white">
            {/* SCANLINE EFFECT overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" aria-hidden="true" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="z-20 w-full max-w-md"
            >
                <SolidCard>
                    <header className="space-y-4">
                        <div className="flex justify-center">
                            <div className="p-4 rounded-full bg-white/5 border border-white/10 text-[var(--accent)]">
                                <Shield size={32} strokeWidth={1.5} />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-normal">{t.auth.identity}</h1>
                            <p className="text-sm text-white/50 mt-2">
                                {t.auth.selectMethod}
                            </p>
                        </div>
                    </header>

                    <div className="space-y-4">
                        {modules.socialAuth && <SocialProviders lastUsed={lastUsed} markLastUsed={markPendingAuth} />}

                        <div className="flex items-center gap-4 py-4" aria-hidden="true">
                            <div className="flex-1 h-[1px] bg-white/5" />
                            <span className="text-xs font-semibold text-white/50">{t.auth.or}</span>
                            <div className="flex-1 h-[1px] bg-white/5" />
                        </div>

                        <Button
                            variant="solid-accent"
                            onClick={() => {
                                setIsMagicLinkMode(!isMagicLinkMode);
                                setIsCredentialsMode(false);
                            }}
                            className="w-full relative group"
                            aria-expanded={isMagicLinkMode}
                            aria-controls="magic-link-form"
                        >
                            <span className="flex items-center gap-2">
                                <Mail size={14} className="group-hover:scale-110 transition-transform" /> Passwordless Link
                            </span>
                            {lastUsed === "resend" && (
                                <span className="absolute -top-[9px] right-6 text-[8px] bg-[var(--accent)] text-white h-[18px] px-2 flex items-center justify-center rounded-sm tracking-normal font-bold z-10 ring-1 ring-white/20 shadow-lg">
                                    {t.auth.lastUsed}
                                </span>
                            )}
                        </Button>

                        <AnimatePresence>
                            {isMagicLinkMode && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <MagicLinkForm markLastUsed={() => markPendingAuth("resend")} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex items-center gap-4 py-2" aria-hidden="true">
                            <div className="flex-1 h-[1px] bg-white/5" />
                        </div>

                        <Button
                            variant="solid"
                            onClick={() => {
                                setIsCredentialsMode(!isCredentialsMode);
                                setIsMagicLinkMode(false);
                            }}
                            className="w-full relative"
                            aria-expanded={isCredentialsMode}
                            aria-controls="credentials-form"
                        >
                            <span className="flex items-center gap-2">
                                <Mail size={14} /> {t.auth.identityPassword}
                            </span>
                            {lastUsed === "credentials" && (
                                <span className="absolute -top-[9px] right-6 text-[8px] bg-[var(--accent)] text-white h-[18px] px-2 flex items-center justify-center rounded-sm tracking-normal font-bold z-10 ring-1 ring-white/20 shadow-lg">
                                    {t.auth.lastUsed}
                                </span>
                            )}
                        </Button>

                        <AnimatePresence>
                            {isCredentialsMode && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <Suspense fallback={null}>
                                        <CredentialsForm markLastUsed={() => markPendingAuth("credentials")} />
                                    </Suspense>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <footer className="pt-6 border-t border-white/5">
                        <p className="text-xs text-white/30 text-center max-w-[300px] mx-auto">
                            {t.auth.accessControlled}
                        </p>
                    </footer>
                </SolidCard>
            </motion.div>
        </main>
    );
}
