"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ACTIVE_THEME } from "@/theme/config";
import Link from "next/link";
import { ChevronRight, ArrowUpRight, Shield, Box, Network, Globe, Database, Lock, CreditCard, Image, Key, Search, Layers, Terminal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IdentityBadge } from "@/components/ui/IdentityBadge";
import SovereignCanvas from "@/components/ui/SovereignCanvas";
import { useState } from "react";
import { useTranslation } from "@/core/i18n/LanguageProvider";

const FEATURE_ICONS = [Shield, Box, Network, Globe, Database, Lock, CreditCard, Image, Key, Search, Layers, Terminal];

export default function HomePage() {
    const { t } = useTranslation();
    const [isPreview, setIsPreview] = useState(false);

    return (
        <main className="relative min-h-screen flex flex-col items-center justify-center p-8 pt-24 pb-32 overflow-x-hidden overflow-y-auto text-white">

            <AnimatePresence mode="wait">
                {!isPreview ? (
                    <motion.section
                        key="hero"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="z-10 text-center space-y-6 flex flex-col items-center"
                        role="region"
                        aria-label="Identity Showcase"
                    >
                        <IdentityBadge />

                        <motion.h1
                            initial={{ scale: 0.98 }}
                            animate={{ scale: 1 }}
                            className="text-6xl md:text-[7rem] font-black tracking-tighter leading-none uppercase"
                        >
                            {t.siteName}
                        </motion.h1>

                        <p className="text-white/40 text-[10px] md:text-sm font-black uppercase tracking-[0.3em] max-w-xl mx-auto leading-relaxed">
                            {t.tagline}
                        </p>

                        <div className="pt-16 flex flex-col sm:flex-row gap-4 justify-center w-full max-w-lg">
                            <Button
                                variant="glass-accent"
                                className="w-full sm:w-1/2 flex justify-center py-4 text-xs tracking-widest uppercase font-bold"
                                onClick={() => setIsPreview(true)}
                                aria-label="View Archive"
                            >
                                {t.home.viewArchive}
                                <ArrowUpRight size={14} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform ml-2" />
                            </Button>
                            <Button
                                as={Link}
                                href="/en/demo"
                                variant="glass"
                                className="w-full sm:w-1/2 flex justify-center py-4 text-xs tracking-widest uppercase font-bold border border-[var(--accent)]/50 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
                                aria-label="View Demo"
                            >
                                Live Demo Matrix
                            </Button>
                        </div>
                    </motion.section>
                ) : (
                    <motion.section
                        key="preview"
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                        className="z-10 w-full max-w-5xl flex flex-col items-center space-y-12"
                    >
                        <div className="text-center space-y-4">
                            <h2 className="text-3xl font-black uppercase tracking-widest">
                                {t.home.ecosystemPreview}
                            </h2>
                            <p className="text-[10px] text-white/50 uppercase tracking-[0.3em]">
                                {t.home.architecturalForms}
                            </p>
                        </div>

                        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
                            {t.home.features.map((feature, i) => {
                                const Icon = FEATURE_ICONS[i] || Box;
                                return (
                                    <div key={i} className="glass p-6 flex flex-col border border-white/5 space-y-2 text-left hover:border-[var(--accent)]/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Icon size={16} className="text-[var(--accent)]" />
                                            <h3 className="text-sm font-black tracking-widest uppercase text-white/90">
                                                {feature.title}
                                            </h3>
                                        </div>
                                        <p className="text-[10px] text-white/50 tracking-widest leading-relaxed">
                                            {feature.desc}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        <Button
                            variant="glass"
                            onClick={() => setIsPreview(false)}
                            className="mt-12 group"
                        >
                            {t.home.returnToInterface}
                        </Button>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* Grid Backdrop */}
            <div className="absolute inset-0 z-[-1] opacity-5 pointer-events-none" aria-hidden="true">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>

            {/* Sovereign WebGL Canvas Backdrop */}
            <div className="absolute inset-0 z-[-2] opacity-40 mix-blend-screen pointer-events-none" aria-hidden="true">
                <SovereignCanvas />
            </div>
        </main>
    );
}
