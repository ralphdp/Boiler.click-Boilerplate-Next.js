"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface FAQ {
    q: string;
    a: string;
}

function FAQItem({ faq }: { faq: FAQ }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="flex flex-col group p-6 border-b border-white/5 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between outline-none text-left w-full hover:text-[var(--accent)] transition-colors"
                aria-expanded={isOpen}
            >
                <span className="font-bold text-lg">{faq.q}</span>
                <ChevronDown
                    size={20}
                    className={`transform transition-transform duration-300 text-white/50 group-hover:text-[var(--accent)] ${isOpen ? "rotate-180 text-[var(--accent)]" : ""}`}
                />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <p className="pt-4 text-white/60 font-mono text-sm leading-relaxed">
                            {faq.a}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function FAQAccordion({ faqs, title, description }: { faqs: FAQ[]; title: string; description?: string }) {
    return (
        <GlassCard className="border border-white/10 bg-transparent flex flex-col p-0 overflow-hidden max-w-4xl mx-auto w-full">
            <div className="p-8 pb-4 flex flex-col items-center text-center">
                <h3 className="text-2xl font-bold uppercase tracking-widest text-[var(--accent)] mb-4">{title}</h3>
                {description && (
                    <p className="text-white/50 text-sm font-mono max-w-2xl">
                        {description}
                    </p>
                )}
            </div>

            <div className="divide-y divide-white/5 w-full">
                {faqs.map((faq, i) => (
                    <FAQItem key={i} faq={faq} />
                ))}
            </div>
        </GlassCard>
    );
}
