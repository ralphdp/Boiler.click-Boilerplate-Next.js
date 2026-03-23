"use client";

import { motion } from "framer-motion";
import { Shield, Box, Network, Globe, Database, Lock, CreditCard, Image, Key, Search, Layers, Terminal, ChevronLeft } from "lucide-react";
import { useTranslation } from "@/core/i18n/LanguageProvider";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const FEATURE_ICONS = [Shield, Box, Network, Globe, Database, Lock, CreditCard, Image, Key, Search, Layers, Terminal];

export default function FeaturesPage() {
    const { t, language } = useTranslation();

    return (
        <main className="relative min-h-screen flex flex-col items-center p-8 pt-32 pb-32 overflow-x-hidden overflow-y-auto text-white">
            <motion.section
                key="preview"
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="z-10 w-full max-w-5xl flex flex-col items-center space-y-12"
            >
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold tracking-normal text-white">
                        {t.home.ecosystemPreview}
                    </h1>
                    <p className="text-sm text-white/50 leading-relaxed font-semibold">
                        {t.home.architecturalForms}
                    </p>
                </div>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
                    {t.home.features.map((feature, i) => {
                        const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length] || Box;
                        return (
                            <div key={i} className="bg-[#0a0a0a] p-6 flex flex-col border border-white/10 space-y-3 text-left hover:border-[var(--accent)]/50 transition-colors rounded-xl shadow-lg">
                                <div className="flex items-center gap-3">
                                    <Icon size={18} className="text-[var(--accent)]" />
                                    <h3 className="text-base font-semibold text-white">
                                        {feature.title}
                                    </h3>
                                </div>
                                <p className="text-sm text-white/60 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <Button
                    as={Link}
                    href={`/${language}`}
                    variant="solid"
                    className="mt-12 group flex items-center justify-center gap-2 px-6 w-fit"
                >
                    <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    {t.home.returnToInterface}
                </Button>
            </motion.section>

            {/* Grid Backdrop */}
            <div className="fixed inset-0 z-[-1] opacity-5 pointer-events-none" aria-hidden="true">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>
        </main>
    );
}
