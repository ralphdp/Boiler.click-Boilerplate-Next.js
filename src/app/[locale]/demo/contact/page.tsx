"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Send, Mail, User, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { useTranslation } from "@/core/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { useState } from "react";

export default function ContactDemoPage() {
    const { t, language } = useTranslation();
    const { toast } = useToast();
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        setTimeout(() => {
            setIsSending(false);
            toast({
                title: t.demoMatrix.opTriumphant,
                description: t.demoMatrix.handshakeSuccess,
                type: "success"
            });
        }, 1500);
    };

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
                    <Send size={12} />
                    Handshake Protocol v1.0
                </div>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest">
                    Identity <span className="text-[var(--accent)]">Vector</span>
                </h1>
                <p className="text-white/50 font-serif italic text-lg max-w-2xl mx-auto">
                    A high-fidelity interface for outbound administrative communication.
                </p>
            </motion.div>

            <div className="w-full max-w-2xl z-10 pb-32">
                <GlassCard className="p-8 md:p-12 border-[var(--accent)]/20 shadow-[0_0_50px_rgba(var(--accent-rgb),0.1)]">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="block text-left text-[10px] uppercase tracking-widest text-[var(--accent)] font-black ml-1">
                                    {t.auth.identity}
                                </label>
                                <div className="relative group">
                                    <input
                                        required
                                        type="text"
                                        placeholder="ARCHITECT NAME"
                                        className="w-full bg-white/5 border border-white/10 px-10 py-4 text-sm font-mono focus:border-[var(--accent)] focus:bg-[var(--accent)]/5 outline-none transition-all"
                                    />
                                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[var(--accent)] transition-colors" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-left text-[10px] uppercase tracking-widest text-[var(--accent)] font-black ml-1">
                                    {t.auth.email}
                                </label>
                                <div className="relative group">
                                    <input
                                        required
                                        type="email"
                                        placeholder="NODE@PROTOCOL.CX"
                                        className="w-full bg-white/5 border border-white/10 px-10 py-4 text-sm font-mono focus:border-[var(--accent)] focus:bg-[var(--accent)]/5 outline-none transition-all"
                                    />
                                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[var(--accent)] transition-colors" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-left text-[10px] uppercase tracking-widest text-[var(--accent)] font-black ml-1">
                                Message Payload
                            </label>
                            <div className="relative group">
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="INITIATE MESSAGE TRANSMISSION..."
                                    className="w-full bg-white/5 border border-white/10 px-10 py-4 text-sm font-mono focus:border-[var(--accent)] focus:bg-[var(--accent)]/5 outline-none transition-all resize-none"
                                />
                                <MessageSquare size={16} className="absolute left-4 top-4 text-white/30 group-focus-within:text-[var(--accent)] transition-colors" />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isSending}
                            className="w-full bg-[var(--accent)] text-white hover:bg-white hover:text-black transition-all group overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {isSending ? "[ TRANSMITTING... ]" : "EXECUTE TRANSMISSION"}
                                {!isSending && <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                            </span>
                        </Button>
                    </form>
                </GlassCard>
            </div>

            {/* Grid Backdrop */}
            <div className="fixed inset-0 z-[-1] opacity-5 pointer-events-none" aria-hidden="true">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>
        </main>
    );
}
