"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Send } from "lucide-react";
import { useTranslation } from "@/core/i18n/LanguageProvider";

export function WaitlistScreen({ siteName = "Sovereign Substrate" }: { siteName?: string }) {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const res = await fetch('/api/lead-capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, interest: "Waitlist / Stealth Deployment", name: "Anonymous" })
            });
            const data = await res.json();
            if (data.success) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch {
            setStatus('error');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-black relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--accent)]/10 blur-[150px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="z-10 w-full max-w-lg space-y-12"
            >
                <div className="space-y-6 text-center">
                    <div className="inline-flex p-3 bg-white/5 border border-white/10 mx-auto">
                        <ShieldCheck className="w-8 h-8 text-[var(--accent)]" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-widest uppercase technical drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                            {siteName}
                        </h1>
                        <p className="text-[var(--accent)] text-sm md:text-base font-mono uppercase tracking-[0.2em] relative inline-block">
                            {t.waitlist.calibrationSequence}
                            <span className="absolute -right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-[var(--accent)] rounded-full animate-ping"></span>
                        </p>
                    </div>
                    <p className="text-white/50 text-sm max-w-md mx-auto leading-relaxed border-l-2 border-[var(--accent)]/30 pl-4 text-left font-serif italic">
                        {t.waitlist.stealthRefinement}
                    </p>
                </div>

                <div className="bg-white/[0.02] border border-white/10 p-6 backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                    {status === 'success' ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center space-y-4 py-8"
                        >
                            <Send className="w-8 h-8 text-[var(--accent)] mx-auto" />
                            <p className="text-sm font-mono text-[var(--accent)] uppercase tracking-widest">{t.waitlist.vectorRecorded}</p>
                            <p className="text-xs text-white/40 font-mono">{t.waitlist.summonedUponLaunch}</p>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{t.waitlist.digitalVector}</label>
                                <input
                                    required
                                    type="email"
                                    placeholder={t.waitlist.enterEmail}
                                    className="w-full bg-black/50 border border-white/10 px-4 py-4 text-sm tracking-wide outline-none focus:border-[var(--accent)]/50 transition-all text-white placeholder:text-white/20 font-mono"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={status === 'submitting'}
                                />
                            </div>
                            <button
                                disabled={status === 'submitting'}
                                type="submit"
                                className="w-full py-4 bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30 font-mono uppercase tracking-[0.2em] text-xs hover:bg-[var(--accent)] hover:text-black transition-all disabled:opacity-50 relative overflow-hidden"
                            >
                                {status === 'submitting' ? t.waitlist.authenticating : t.waitlist.requestAccess}
                            </button>
                            {status === 'error' && (
                                <p className="text-[10px] font-mono uppercase text-red-500 text-center tracking-widest pt-2">{t.waitlist.transmissionFailed}</p>
                            )}
                        </form>
                    )}
                </div>

                <div className="text-center opacity-30 pointer-events-none">
                    <span className="text-[8px] font-mono uppercase tracking-[0.3em] inline-block border-t border-white/20 pt-4 px-8">
                        {t.waitlist.securedBy}
                    </span>
                </div>
            </motion.div>
        </div>
    );
}
