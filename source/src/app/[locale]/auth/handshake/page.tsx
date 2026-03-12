"use client";

import { useState, Suspense, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ACTIVE_THEME } from "@/theme/config";
import { Shield, Mail } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { SocialProviders } from "@/components/auth/SocialProviders";
import { CredentialsForm } from "@/components/auth/CredentialsForm";
import { useTranslation } from "@/core/i18n/LanguageProvider";

export default function HandshakePage() {
    const { t } = useTranslation();
    const [isCredentialsMode, setIsCredentialsMode] = useState(false);
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
                <GlassCard>
                    <header className="space-y-4">
                        <div className="flex justify-center">
                            <div className="p-4 rounded-full glass text-accent">
                                <Shield size={32} strokeWidth={1.5} />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black technical tracking-[0.2em]">{t.auth.identity}</h1>
                            <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-bold mt-2">
                                {t.auth.selectMethod}
                            </p>
                        </div>
                    </header>

                    <div className="space-y-4">
                        <SocialProviders lastUsed={lastUsed} markLastUsed={markPendingAuth} />

                        <div className="flex items-center gap-4 py-4" aria-hidden="true">
                            <div className="flex-1 h-[1px] bg-white/5" />
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{t.auth.or}</span>
                            <div className="flex-1 h-[1px] bg-white/5" />
                        </div>

                        <Button
                            variant="glass-accent"
                            onClick={() => setIsCredentialsMode(!isCredentialsMode)}
                            className="w-full relative"
                            aria-expanded={isCredentialsMode}
                            aria-controls="credentials-form"
                        >
                            <span className="flex items-center gap-2">
                                <Mail size={14} /> {t.auth.identityPassword}
                            </span>
                            {lastUsed === "credentials" && (
                                <span className="absolute -top-[9px] right-6 text-[8px] bg-[var(--accent)] text-white h-[18px] px-2 flex items-center justify-center rounded-sm uppercase tracking-widest font-bold z-10 ring-1 ring-white/20 shadow-lg">
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
                        <p className="text-[8px] text-white/10 uppercase font-bold tracking-widest leading-loose max-w-[300px] mx-auto">
                            {t.auth.accessControlled}
                        </p>
                    </footer>
                </GlassCard>
            </motion.div>
        </main>
    );
}
