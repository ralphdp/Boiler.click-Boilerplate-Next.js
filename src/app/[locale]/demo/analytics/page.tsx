"use client";

import { motion } from "framer-motion";
import {
    ArrowLeft, Activity, BarChart3, PieChart, TrendingUp, Zap, Clock, Disc,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { useTranslation } from "@/core/i18n/LanguageProvider";

export default function AnalyticsDemoPage() {
    const { language } = useTranslation();

    const metrics = [
        { label: "REQUEST RATE", value: "1.2k", sub: "per/sec", icon: Zap },
        { label: "LATENCY", value: "42ms", sub: "average", icon: Clock },
        { label: "ERROR RATE", value: "0.02%", sub: "nominal", icon: Activity },
        { label: "STORAGE PENDING", value: "256MB", sub: "in buffer", icon: Disc }
    ];

    const chartBars = [40, 70, 45, 90, 65, 80, 55, 100, 85, 60, 75, 50];

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
                    <BarChart3 size={12} />
                    SYSTEM TELEMETRY v1.0
                </div>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest leading-none">
                    Telemetry <span className="text-[var(--accent)]">Shards</span>
                </h1>
                <p className="text-white/50 font-serif italic text-lg max-w-2xl mx-auto">
                    Visualizing the underlying computational state of the Vanguard substrate.
                </p>
            </motion.div>

            {/* Metrics Grid */}
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {metrics.map((m, i) => (
                    <GlassCard key={i} className="p-8 space-y-4 border-white/5 hover:border-[var(--accent)]/30 transition-all">
                        <div className="text-[var(--accent)] opacity-50">
                            {/* Simple fallback since Lucide icons are being passed */}
                            <m.icon size={20} />
                        </div>
                        <div className="space-y-1">
                            <div className="text-3xl font-black font-mono">{m.value}</div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-white/30">{m.label} // {m.sub}</div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Large Visual Section */}
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6 pb-32">
                <GlassCard className="lg:col-span-2 p-12 space-y-8 min-h-[400px]">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp size={16} className="text-[var(--accent)]" />
                            Throughput Pulse
                        </h3>
                        <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest">REAL-TIME SYNCED</div>
                    </div>
                    {/* Simulated Chart */}
                    <div className="h-48 flex items-end gap-2 md:gap-4 overflow-hidden pt-8">
                        {chartBars.map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ delay: i * 0.05, duration: 1 }}
                                className="flex-1 bg-gradient-to-t from-[var(--accent)] to-[var(--accent)]/20 min-w-[8px] opacity-40 hover:opacity-100 transition-opacity rounded-t-sm"
                            />
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-12 pt-8 border-t border-white/5">
                        <div className="space-y-2">
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Peak Execution</div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                                <span className="text-lg font-mono">1.84 TB/S</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Network Health</div>
                            <div className="flex items-center gap-2 text-emerald-500">
                                <CheckCircle2 size={16} />
                                <span className="text-lg font-mono uppercase">Optimal</span>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-12 space-y-12">
                    <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                        <PieChart size={16} className="text-[var(--accent)]" />
                        Allocations
                    </h3>
                    <div className="space-y-8">
                        {[
                            { label: "Edge Functions", value: 65 },
                            { label: "Auth Middleware", value: 15 },
                            { label: "Static Assets", value: 20 }
                        ].map(a => (
                            <div key={a.label} className="space-y-3">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span>{a.label}</span>
                                    <span className="text-[var(--accent)]">{a.value}%</span>
                                </div>
                                <div className="w-full h-1 bg-white/5 relative">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${a.value}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="absolute top-0 left-0 h-full bg-[var(--accent)]"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>

            {/* Grid Backdrop */}
            <div className="fixed inset-0 z-[-1] opacity-5 pointer-events-none" aria-hidden="true">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>
        </main>
    );
}
