"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, ChevronRight, Terminal, Command, Layers, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/core/i18n/LanguageProvider";
import { SystemHeartbeat } from "@/components/ui/SystemHeartbeat";

export default function HomePage() {
    const { t, language } = useTranslation();

    return (
        <main className="relative min-h-screen bg-[#000000] overflow-hidden text-white font-sans selection:bg-[var(--accent)] selection:text-black">
            {/* Elite Background Composition */}
            <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(var(--accent-rgb),0.1)_0%,transparent_60%)] pointer-events-none" />
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                    maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)',
                    WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
                }}
            />

            {/* Main Content Container */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24 flex flex-col items-center">

                {/* Premium Pill Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-md backdrop-blur-md mb-8 hover:bg-white/[0.05] transition-colors cursor-pointer group"
                >
                    <span className="flex h-2 w-2 rounded-full bg-[var(--accent)] relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-50"></span>
                    </span>
                    <span className="text-xs font-medium text-white/80">Vanguard Architecture deployed</span>
                    <ChevronRight size={14} className="text-white/40 group-hover:text-white/80 transition-colors group-hover:translate-x-0.5" />
                </motion.div>

                {/* Hero Typography */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center max-w-4xl space-y-6"
                >
                    <h1 className="text-5xl sm:text-7xl md:text-[6rem] font-bold tracking-normal leading-[1.05] text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/60">
                        {t.siteName}
                    </h1>

                    <p className="text-lg md:text-xl text-[#888888] font-medium max-w-2xl mx-auto leading-relaxed">
                        {t.tagline}
                    </p>
                </motion.div>

                {/* Primary Action Array */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-10 w-full flex-wrap"
                >
                    <Link
                        href={`/${language}/dashboard`}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-md bg-white text-black font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                    >
                        {t.home.dashboard || "Initialize Substrate"}
                        <Command size={16} className="opacity-60" />
                    </Link>

                    <Link
                        href={`/${language}/demo`}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-md bg-[var(--accent)] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)]"
                    >
                        <span className="text-white">Demo Hub Matrix</span>
                        <ArrowUpRight size={16} className="opacity-80 text-white" />
                    </Link>

                    <Link
                        href={`/${language}/features`}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-md bg-white/[0.03] text-white border border-white/[0.08] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/[0.08] transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {t.home.viewArchive || "Explore Architecture"}
                        <ChevronRight size={16} className="opacity-60" />
                    </Link>
                </motion.div>

                {/* Mock UI Showcase / Perspective Component */}
                <motion.div
                    initial={{ opacity: 0, y: 40, rotateX: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                    transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-24 w-full max-w-5xl rounded-md border border-white/10 bg-[#050505] relative overflow-hidden"
                    style={{ perspective: "1000px" }}
                >
                    {/* Fake Mac Header */}
                    <div className="flex items-center px-4 py-3 border-b border-white/[0.08] bg-white/[0.02]">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#333333]" />
                            <div className="w-3 h-3 rounded-full bg-[#333333]" />
                            <div className="w-3 h-3 rounded-full bg-[#333333]" />
                        </div>
                        <div className="mx-auto flex gap-2 text-xs font-medium text-[#666666]">
                            <Terminal size={14} /> SOVEREIGN_KERNEL_v1.0.0
                        </div>
                    </div>

                    {/* Window Content */}
                    <div className="p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 h-[400px] relative">

                        <div className="space-y-8 z-10 w-full lg:w-1/2">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-bold tracking-normal">
                                    <Layers size={12} /> Root Module Active
                                </div>
                                <h3 className="text-2xl font-semibold text-white">Full-Spectrum Architecture</h3>
                                <p className="text-sm text-[#888888] leading-relaxed">
                                    The Sovereign Boilerplate encapsulates an uncompromising stack. Zero technical
                                    debt, strict type matrices, and cryptographic telemetry.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="text-[10px] text-[#666666] font-semibold tracking-normal">Latency Target</div>
                                    <div className="text-lg font-mono text-white">{'<'}20 ms</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] text-[#666666] font-semibold tracking-normal">Security Auth</div>
                                    <div className="text-lg font-medium text-white flex items-center gap-2">
                                        <ShieldCheck size={16} className="text-green-500" /> Hardened
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Telemetry Focus Box */}
                        <div className="z-10 w-full lg:w-auto">
                            <SystemHeartbeat />
                        </div>
                    </div>
                </motion.div>

            </div>

        </main>
    );
}
