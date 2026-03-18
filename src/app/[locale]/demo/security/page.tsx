"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, Lock, Key, Smartphone, AlertTriangle, ShieldAlert, Fingerprint } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { useTranslation } from "@/core/i18n/LanguageProvider";

export default function SecurityDemoPage() {
    const { t, language } = useTranslation();

    const securityNodes = [
        { title: "MFA Enforced", status: "ACTIVE", icon: Smartphone, desc: "TOTP and SMS relay active globally." },
        { title: "Session Hardening", status: "STABLE", icon: Lock, desc: "Automatic sibling session severance." },
        { title: "Cipher Integrity", status: "OPTIMAL", icon: Key, desc: "HS256 encryption on all identity vectors." }
    ];

    return (
        <main className="relative min-h-screen p-6 text-white overflow-hidden flex flex-col items-center">
            {/* Nav */}
            <div className="w-full max-w-6xl mt-12 mb-12">
                <Button as={Link} href={`/${language}/demo`} variant="ghost" className="w-fit text-white/50 px-0">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Hub
                </Button>
            </div>

            {/* Hero */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl text-center space-y-6 mb-24"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                    <ShieldCheck size={12} />
                    IDENTITY FIREWALL v6.11
                </div>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest leading-none">
                    Security <span className="text-[var(--accent)]">Matrix</span>
                </h1>
                <p className="text-white/50 font-serif italic text-lg max-w-2xl mx-auto">
                    Visualizing the cryptographic safeguards and identity protection protocols.
                </p>
            </motion.div>

            {/* Security Nodes */}
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {securityNodes.map((node, i) => (
                    <GlassCard key={i} className="p-10 space-y-6 border-white/5 relative group hover:border-[var(--accent)]/30 transition-all overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                            <div className="text-[9px] font-black tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-1 border border-emerald-500/20">
                                {node.status}
                            </div>
                        </div>
                        <node.icon size={32} className="text-[var(--accent)] opacity-40 group-hover:opacity-100 transition-opacity" />
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold uppercase tracking-widest">{node.title}</h3>
                            <p className="text-xs text-white/40 font-mono leading-relaxed">{node.desc}</p>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Large Security Visualization */}
            <div className="w-full max-w-6xl pb-32">
                <GlassCard className="p-12 md:p-16 border-[var(--accent)]/10 bg-gradient-to-br from-[var(--accent)]/5 to-transparent relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-[var(--accent)]/10 blur-[120px] rounded-full pointer-events-none" />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-12">
                            <div className="space-y-4">
                                <h2 className="text-3xl font-black uppercase tracking-widest">Threat <span className="text-[var(--accent)]">Detection</span></h2>
                                <p className="text-white/50 font-mono text-sm uppercase tracking-widest">Active Edge Protection Node // Pulse: STABLE</p>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { label: "Brute Force Protection", value: "ENABLED", color: "text-emerald-500" },
                                    { label: "IP Rate Limiting", value: "STRICT", color: "text-[var(--accent)]" },
                                    { label: "Disposable Email Filter", value: "ACTIVE", color: "text-emerald-500" },
                                    { label: "SQLi/XSS Injection Shield", value: "MANDATED", color: "text-[var(--accent)]" }
                                ].map(t => (
                                    <div key={t.label} className="flex justify-between items-center py-4 border-b border-white/5">
                                        <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40">{t.label}</span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${t.color}`}>{t.value}</span>
                                    </div>
                                ))}
                            </div>

                            <Button className="w-fit bg-white text-black hover:bg-[var(--accent)] hover:text-white transition-all text-[10px] px-8">
                                RUN SYSTEM AUDIT
                            </Button>
                        </div>

                        <div className="relative flex items-center justify-center p-12 lg:p-0">
                            {/* Animated Shield Visual */}
                            <div className="relative w-64 h-64 flex items-center justify-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border-2 border-dashed border-[var(--accent)]/20 rounded-full"
                                />
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-8 border border-white/10 rounded-full"
                                />
                                <div className="z-10 bg-black/50 backdrop-blur-xl p-8 rounded-full border border-[var(--accent)]/30 group">
                                    <Fingerprint size={64} className="text-[var(--accent)] animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Grid Backdrop */}
            <div className="fixed inset-0 z-[-1] opacity-5 pointer-events-none" aria-hidden="true">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] [background-size:64px_64px]" />
            </div>
        </main>
    );
}
