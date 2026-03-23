"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SolidCard } from "@/components/ui/SolidCard";
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
            tag: "Commerce"
        },
        {
            title: "Marketplace",
            desc: "Product arrays, asset acquisition, and Stripe checkout logic.",
            href: `/${language}/demo/marketplace`,
            icon: ShoppingBag,
            tag: "Commerce"
        },
        {
            title: "Landing Page Alpha",
            desc: "High-fidelity conversion layout with premium typography.",
            href: `/${language}/demo/landing-page-1`,
            icon: Layout,
            tag: "Interface"
        },
        {
            title: "Analytics Node",
            desc: "Real-time telemetry shards and systemic health visualizations.",
            href: `/${language}/demo/analytics`,
            icon: Activity,
            tag: "Data"
        },
        {
            title: "Security Matrix",
            desc: "MFA protocols, session hardening, and identity encryption.",
            href: `/${language}/demo/security`,
            icon: ShieldCheck,
            tag: "Identity"
        },
        {
            title: "Launchpad",
            desc: "Stealth-mode waitlist interface and email capture.",
            href: `/${language}/demo/waitlist`,
            icon: Sparkles,
            tag: "Growth"
        },
        {
            title: "Handshake Protocol",
            desc: "Contact vector with real-time validation and toast feedback.",
            href: `/${language}/demo/contact`,
            icon: Send,
            tag: "Identity"
        },
        {
            title: "Knowledge Base",
            desc: "Categorized FAQ accordions and parameterized queries.",
            href: `/${language}/demo/faq`,
            icon: HelpCircle,
            tag: "System"
        }
    ];

    return (
        <main className="relative min-h-screen p-6 bg-black text-white overflow-hidden flex flex-col items-center selection:bg-[var(--accent)] selection:text-black">
            {/* Ambient Background Gradient */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(var(--accent-rgb),0.05)_0%,transparent_70%)] pointer-events-none" />

            {/* Nav */}
            <div className="w-full max-w-6xl mt-12 mb-12 relative z-10 flex justify-start">
                <Button as={Link} href={`/${language}`} variant="ghost" className="w-fit text-white/50 hover:text-white px-0 transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Protocol
                </Button>
            </div>

            {/* Hero */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-4xl text-center space-y-6 mb-24 relative z-10"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md mb-4 group cursor-default">
                    <span className="flex h-2 w-2 rounded-full bg-[var(--accent)] relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-50"></span>
                    </span>
                    <span className="text-xs font-medium text-white/80">Vanguard Demo Hub</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-normal leading-none text-white">
                    The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-white/70">Matrix</span> Hub
                </h1>
                <p className="text-[#888888] font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                    A centralized routing node for experiencing the decoupled architectural capabilities of the Sovereign boilerplate.
                </p>
            </motion.div>

            {/* Hub Grid */}
            <div className="w-full max-w-6xl relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32">
                {demoNodes.map((node, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <Link href={node.href} className="group outline-none block h-full">
                            <SolidCard className="p-8 h-full flex flex-col justify-between border border-white/[0.08] bg-[#0a0a0a] group-hover:border-[var(--accent)]/40 transition-all duration-300 relative overflow-hidden rounded-xl shadow-2xl">

                                <div className="space-y-6 relative z-10">
                                    <div className="flex justify-between items-start">
                                        <div className="w-12 h-12 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center p-0 text-white/50 group-hover:text-[var(--accent)] transition-colors group-hover:bg-[var(--accent)]/10">
                                            <node.icon size={20} />
                                        </div>
                                        <span className="text-xs font-semibold text-white/40 group-hover:text-[var(--accent)] transition-colors mt-2">
                                            {node.tag}
                                        </span>
                                    </div>
                                    <div className="space-y-4 text-left">
                                        <h3 className="text-xl font-semibold text-white tracking-normal">{node.title}</h3>
                                        <p className="text-sm text-[#888888] leading-relaxed">{node.desc}</p>
                                    </div>
                                </div>

                                <div className="mt-8 flex items-center text-[var(--accent)] text-sm font-semibold opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                                    Initialize Node <ChevronRight size={16} className="ml-1" />
                                </div>
                            </SolidCard>
                        </Link>
                    </motion.div>
                ))}

                {/* Status Console (Full width on small, last card size on large) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="lg:col-span-1"
                >
                    <TerminalConsole lines={terminalLines} title="System Telemetry" />
                </motion.div>
            </div>

            {/* Footer Statistics */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
                className="w-full max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-8 pb-32 border-t border-white/[0.08] pt-12 relative z-10"
            >
                {[
                    { icon: ShieldCheck, label: "Identity Matrix", value: "Verified" },
                    { icon: Database, label: "DB Substrate", value: "Active" },
                    { icon: Cpu, label: "Compute Node", value: "Stable" },
                    { icon: Activity, label: "Latency", value: "< 20ms" }
                ].map((stat, i) => (
                    <div key={i} className="flex flex-col items-center md:items-start gap-3">
                        <div className="flex items-center gap-2 text-[var(--accent)]">
                            <stat.icon size={16} />
                            <span className="text-xs font-semibold text-white/50">{stat.label}</span>
                        </div>
                        <span className="text-base font-medium text-white/90">{stat.value}</span>
                    </div>
                ))}
            </motion.div>
        </main>
    );
}
