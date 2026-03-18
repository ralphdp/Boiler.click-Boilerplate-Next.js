"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
    ArrowLeft, Rocket, ShoppingBag, Send, HelpCircle, Layout,
    TerminalSquare, ShieldCheck, Database, Cpu, Activity,
    Box, ChevronRight, Sparkles
} from "lucide-react";
import { useTranslation } from "@/core/i18n/LanguageProvider";
import { TerminalConsole } from "@/components/demo/TerminalConsole";

export default function DemoHubPage() {
    const { t, language } = useTranslation();
    const [terminalLines, setTerminalLines] = useState<string[]>([
        "Initializing Demo Hub...",
        "Scanning navigational nodes...",
        "Substrate Hub active."
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            const logs = [
                "Nodal sync complete.",
                "Pulse detected on /saas.",
                "Marketplace matrix verified.",
                "FAQ Knowledge Base synchronized.",
                "Handshake protocol alive.",
            ];
            setTerminalLines(prev => {
                const next = [...prev, logs[Math.floor(Math.random() * logs.length)]];
                return next.length > 5 ? next.slice(next.length - 5) : next;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const demoNodes = [
        {
            title: "SaaS Matrix",
            desc: "Subscription tiers, pricing logic, and feature checkmarks.",
            href: `/${language}/demo/saas`,
            icon: Rocket,
            tag: "COMMERCE"
        },
        {
            title: "Marketplace",
            desc: "Product arrays, asset acquisition, and Stripe checkout logic.",
            href: `/${language}/demo/marketplace`,
            icon: ShoppingBag,
            tag: "COMMERCE"
        },
        {
            title: "Landing Page Alpha",
            desc: "High-fidelity conversion layout with extreme typography.",
            href: `/${language}/demo/landing-page-1`,
            icon: Layout,
            tag: "INTERFACE"
        },
        {
            title: "Analytics Node",
            desc: "Real-time telemetry shards and systemic health visualizations.",
            href: `/${language}/demo/analytics`,
            icon: Activity,
            tag: "DATA"
        },
        {
            title: "Security Matrix",
            desc: "MFA protocols, session hardening, and identity encryption.",
            href: `/${language}/demo/security`,
            icon: ShieldCheck,
            tag: "IDENTITY"
        },
        {
            title: "Launchpad",
            desc: "Stealth-mode waitlist interface and email capture.",
            href: `/${language}/demo/waitlist`,
            icon: Sparkles,
            tag: "GROWTH"
        },
        {
            title: "Handshake Protocol",
            desc: "Contact vector with real-time validation and toast feedback.",
            href: `/${language}/demo/contact`,
            icon: Send,
            tag: "IDENTITY"
        },
        {
            title: "Knowledge Base",
            desc: "Categorized FAQ accordions and parameterized queries.",
            href: `/${language}/demo/faq`,
            icon: HelpCircle,
            tag: "SYSTEM"
        }
    ];

    return (
        <main className="relative min-h-screen p-6 text-white overflow-hidden flex flex-col items-center">
            {/* Nav */}
            <div className="w-full max-w-6xl mt-12 mb-12">
                <Button as={Link} href={`/${language}`} variant="ghost" className="w-fit text-white/50 px-0">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Protocol
                </Button>
            </div>

            {/* Hero */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl text-center space-y-6 mb-24"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                    <Sparkles size={12} />
                    VANGUARD DEMO HUB
                </div>
                <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tight leading-none">
                    THE <span className="text-[var(--accent)]">MATRIX</span> HUB
                </h1>
                <p className="text-white/50 font-serif italic text-lg max-w-2xl mx-auto">
                    A centralized node for experiencing the decoupled architectural capabilities of the Sovereign boilerplate.
                </p>
            </motion.div>

            {/* Hub Grid */}
            <div className="w-full max-w-6xl z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32">
                {demoNodes.map((node, i) => (
                    <Link key={i} href={node.href} className="group outline-none">
                        <GlassCard className="p-8 h-full flex flex-col justify-between border-white/5 group-hover:border-[var(--accent)]/50 group-focus:border-[var(--accent)]/50 transition-all duration-300 relative overflow-hidden">
                            {/* Inner Accent Glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/10 blur-[50px] group-hover:bg-[var(--accent)]/20 transition-all duration-500" />

                            <div className="space-y-6 relative z-10">
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 glass border border-white/10 flex items-center justify-center p-0 text-white/50 group-hover:text-[var(--accent)] transition-colors group-hover:border-[var(--accent)]/30">
                                        <node.icon size={20} />
                                    </div>
                                    <span className="text-[9px] font-black tracking-widest text-white/30 group-hover:text-[var(--accent)] transition-colors mt-2">
                                        {node.tag}
                                    </span>
                                </div>
                                <div className="space-y-2 text-left">
                                    <h3 className="text-xl font-bold uppercase tracking-widest">{node.title}</h3>
                                    <p className="text-xs text-white/50 font-mono leading-relaxed">{node.desc}</p>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center text-[var(--accent)] text-[10px] font-black uppercase tracking-widest opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                                Enter Node <ChevronRight size={12} className="ml-1" />
                            </div>
                        </GlassCard>
                    </Link>
                ))}

                {/* Status Console (Full width on small, last card size on large) */}
                <div className="lg:col-span-1">
                    <TerminalConsole lines={terminalLines} title="System Telemetry" />
                </div>
            </div>

            {/* Footer Statistics */}
            <div className="w-full max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-8 pb-32 border-t border-white/5 pt-12">
                {[
                    { icon: ShieldCheck, label: "Identity Verified", value: "PERSISTENT" },
                    { icon: Database, label: "DB Substrate", value: "FIREBASE 11" },
                    { icon: Cpu, label: "GPU Overload", value: "STABLE" },
                    { icon: Activity, label: "Handshake Rate", value: "1,111 P/S" }
                ].map((stat, i) => (
                    <div key={i} className="flex flex-col items-center md:items-start gap-2">
                        <div className="flex items-center gap-2 text-[var(--accent)]">
                            <stat.icon size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{stat.label}</span>
                        </div>
                        <span className="text-sm font-mono text-white/80">{stat.value}</span>
                    </div>
                ))}
            </div>

            {/* Grid Backdrop */}
            <div className="fixed inset-0 z-[-1] opacity-5 pointer-events-none" aria-hidden="true">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>
        </main>
    );
}
