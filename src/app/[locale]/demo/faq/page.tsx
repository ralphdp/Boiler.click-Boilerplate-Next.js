"use client";

import { motion } from "framer-motion";
import { ArrowLeft, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FAQAccordion } from "@/components/demo/FAQAccordion";
import { useTranslation } from "@/core/i18n/LanguageProvider";

export default function FAQDemoPage() {
    const { t, language } = useTranslation();

    return (
        <main className="relative min-h-screen p-6 text-white overflow-hidden flex flex-col items-center">
            <div className="w-full max-w-6xl mt-12 mb-12">
                <Button as={Link} href={`/${language}/demo`} variant="ghost" className="w-fit text-white/50 px-0">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Hub
                </Button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl text-center space-y-6 mb-24"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                    <HelpCircle size={12} />
                    Knowledge Matrix v1.0
                </div>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest">
                    Protocol <span className="text-[var(--accent)]">Knowledge</span>
                </h1>
                <p className="text-white/50 font-serif italic text-lg max-w-2xl mx-auto">
                    Centralized accordions for architectural queries and support.
                </p>
            </motion.div>

            <div className="w-full max-w-6xl z-10 pb-32">
                <FAQAccordion
                    faqs={t.demoMatrix.faqs}
                    title={t.demoMatrix.protocolDirectives}
                    description={t.demoMatrix.parameterizedQueries}
                />
            </div>

            {/* Grid Backdrop */}
            <div className="fixed inset-0 z-[-1] opacity-5 pointer-events-none" aria-hidden="true">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>
        </main>
    );
}
