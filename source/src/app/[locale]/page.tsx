"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ACTIVE_THEME } from "@/theme/config";
import Link from "next/link";
import { ChevronRight, ArrowUpRight, Shield, Box, Network, Globe, Database, Lock, CreditCard, Image, Key, Search, Layers, Terminal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IdentityBadge } from "@/components/ui/IdentityBadge";
import { useState } from "react";
import { useTranslation } from "@/core/i18n/LanguageProvider";

const FEATURE_ICONS = [Shield, Box, Network, Globe, Database, Lock, CreditCard, Image, Key, Search, Layers, Terminal];

export default function HomePage() {
    const { t, language } = useTranslation();

    return (
        <main className="relative min-h-screen flex flex-col items-center justify-center p-8 pt-24 pb-32 overflow-x-hidden overflow-y-auto text-white">

            <AnimatePresence mode="wait">
                <motion.section
                    key="hero"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="z-10 text-center space-y-6 flex flex-col items-center w-full"
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
                            as={Link}
                            href={`/${language}/features`}
                            variant="glass-accent"
                            className="w-full sm:w-1/2 flex items-center justify-center py-4 text-xs tracking-widest uppercase font-bold group"
                            aria-label="View Archive"
                        >
                            {t.home.viewArchive}
                            <ArrowUpRight size={14} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform ml-2" />
                        </Button>
                        <Button
                            as={Link}
                            href={`/${language}/demo`}
                            variant="glass"
                            className="w-full sm:w-1/2 flex justify-center py-4 text-xs tracking-widest uppercase font-bold border border-[var(--accent)]/50 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
                            aria-label="View Demo"
                        >
                            Live Demo Matrix
                        </Button>
                    </div>
                </motion.section>
            </AnimatePresence>

            {/* Grid Backdrop */}
            <div className="absolute inset-0 z-[-1] opacity-5 pointer-events-none" aria-hidden="true">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>
        </main>
    );
}
